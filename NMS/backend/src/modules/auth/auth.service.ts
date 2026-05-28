import { FastifyInstance } from 'fastify';
import { hashPassword, comparePassword } from '../../shared/utils/hash.js';
import { Role } from '../../shared/types/index.js';
import {
  UnauthorizedError,
  ConflictError,
  BadRequestError,
} from '../../shared/errors/AppError.js';

export class AuthService {
  constructor(private app: FastifyInstance) {}

  /**
   * Registers a new user with one or more roles.
   * The legacy users.role field is still populated with the first selected role
   * for backward compatibility with older parts of the app.
   */
  async register(data: {
    email: string;
    passwordRaw: string;
    name: string;
    role?: Role;
    roles?: Role[];
    agencyId: string;
    phone?: string;
  }) {
    const existingUser = await this.app.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new ConflictError('User with this email already exists');
    }

    const agency = await this.app.prisma.agency.findUnique({
      where: { id: data.agencyId },
    });

    if (!agency) {
      throw new BadRequestError('Invalid agency ID');
    }

    const selectedRoles = this.normalizeRoles(data.roles, data.role);
    const passwordHash = await hashPassword(data.passwordRaw);

    const user = await this.app.prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        name: data.name,
        phone: data.phone,
        agencyId: data.agencyId,
        role: selectedRoles[0],
        roles: {
          create: selectedRoles.map((role) => ({ role })),
        },
      },
      include: {
        roles: true,
        agency: true,
      },
    });

    const roles = user.roles.length ? user.roles.map((r) => r.role) : [user.role];
    const activeRole = roles[0];

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      role: activeRole,
      roles,
      activeRole,
      agencyId: user.agencyId,
      agency: user.agency,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  /**
   * Logs in a user and returns a JWT token with all roles and active role.
   */
  async login(data: { email: string; passwordRaw: string }) {
    const user = await this.app.prisma.user.findUnique({
      where: { email: data.email },
      include: {
        roles: true,
        agency: true,
      },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const isPasswordValid = await comparePassword(data.passwordRaw, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const roles = user.roles.length ? user.roles.map((r) => r.role) : [user.role];
    const activeRole = roles.includes(user.role) ? user.role : roles[0];

   const token = this.app.jwt.sign({
  userId: user.id,
  role: activeRole,
  roles,
  agencyId: user.agencyId,
});

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: activeRole,
        roles,
        activeRole,
        agencyId: user.agencyId,
        agency: user.agency,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    };
  }

  /**
   * Verifies that a user owns a role and returns a new token using that active role.
   */
  async switchRole(userId: string, role: Role) {
    const user = await this.app.prisma.user.findUnique({
      where: { id: userId },
      include: {
        roles: true,
        agency: true,
      },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedError('User not found or inactive');
    }

    const roles = user.roles.length ? user.roles.map((r) => r.role) : [user.role];

    if (!roles.includes(role)) {
      throw new UnauthorizedError('You do not have permission for this role');
    }

    const token = this.app.jwt.sign({
      userId: user.id,
      role,
      roles,
      agencyId: user.agencyId,
    });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role,
        roles,
        activeRole: role,
        agencyId: user.agencyId,
        agency: user.agency,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    };
  }

  private normalizeRoles(roles?: Role[], fallbackRole?: Role): Role[] {
    const source = roles && roles.length > 0 ? roles : [fallbackRole || Role.WATCHER];
    return Array.from(new Set(source));
  }
}
