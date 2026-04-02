import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { env } from '../../config/environment';
import { UserRepository } from '../database/repositories/UserRepository';
import { HashService } from '../../application/services/HashService';

/**
 * Passport strategy wiring.
 *
 * Local strategy authenticates email/password against the repository and hash
 * service. JWT strategy resolves the current user from the bearer token.
 */
const userRepository = new UserRepository();
const hashService = new HashService();

passport.use(
  new LocalStrategy({ usernameField: 'email', passwordField: 'password', session: false }, async (email, password, done) => {
    try {
      const user = await userRepository.findByEmail(email);
      if (!user) {
        return done(null, false, { message: 'Invalid credentials' });
      }

      const valid = await hashService.compare(password, user.passwordHash);
      if (!valid) {
        return done(null, false, { message: 'Invalid credentials' });
      }

      return done(null, {
        id: user.id,
        email: user.email,
        role: user.role,
      });
    } catch (error) {
      return done(error as Error);
    }
  }),
);

passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: env.jwt.accessSecret,
    },
    async (payload, done) => {
      try {
        const user = await userRepository.findById(payload.sub);
        if (!user) {
          return done(null, false);
        }

        return done(null, {
          id: user.id,
          email: user.email,
          role: user.role,
        });
      } catch (error) {
        return done(error as Error, false);
      }
    },
  ),
);

export { passport };
