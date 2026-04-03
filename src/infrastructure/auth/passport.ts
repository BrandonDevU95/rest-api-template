import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { env } from '../../config/environment';
import { UserRepository } from '../database/repositories/UserRepository';
import { HashService } from '../../application/services/HashService';

/**
 * Wiring de estrategias Passport.
 *
 * La estrategia local autentica email/contrasena contra el repositorio y el servicio de hash
 * mientras que la estrategia JWT resuelve el usuario actual desde el bearer token.
 * Se valida que el email del token coincida con el registrado en BD.
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
        // Validar que el email en el token coincida con el stored en BD
        if (!user || user.email !== payload.email) {
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
