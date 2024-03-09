// auth.js
import jwt from 'jsonwebtoken';
import { User } from './user.js';
import { config } from './config.js';

export class Auth {
  /**
   * new user with a username and password, then generates a JWT token for them
   * @param {Object} userDetails - user's username and password
   * @returns {Promise<string>} - A JWT token
   * @throws {Error} - If registration fails
   */
  static async register({ username, password }) {
    try {
      const user = await User.create({ username, password });
      console.log(`User ${username} successfully registered.`);
      return this.generateToken(user);
    } catch (error) {
      console.error(`Registration failed: ${error.message}`);
      throw new Error('Registration failed.');
    }
  }

  /**
   * Authenticates a user with a username and password, then generates a JWT token for them
   * @param {Object} loginDetails - user's username and password
   * @returns {Promise<string>} - A JWT token
   * @throws {Error} - If authentication fails
   */
  static async login({ username, password }) {
    try {
      const user = await User.findByUsername(username);
      const isMatch = await User.comparePassword(password, user.password);
      if (!isMatch) {
        console.error('Incorrect password.');
        throw new Error('Incorrect password.');
      }
      console.log(`User ${username} successfully logged in.`);
      return this.generateToken(user);
    } catch (error) {
      console.error(`Login failed: ${error.message}`);
      throw new Error('Login failed.');
    }
  }


  /**
   * Generates a JWT token for a user
   * @param {Object} user - The user object
   * @returns {string} A JWT token
   */
  static generateToken(user) {
    const payload = { userId: user.id, username: user.username };
    return jwt.sign(payload, config.jwtSecret, { expiresIn: '1h' });
  }

  /**
   * Verifies a JWT token 
   * @param {string} token the JWT token to verify
   * @returns {Object} the decoded token
   * @throws {Error} token is invalid or expired
   */
  static verifyToken(token) {
    try {
      return jwt.verify(token, config.jwtSecret);
    } catch (error) {
      console.error(`Token verification failed: ${error.message}`);
      throw new Error('Invalid or expired token.');
    }
  }

  /**
   * @param {string} username username of user requesting a password reset
   * @returns {Promise<string>} A password reset token
   * @throws {Error} user not found
   */
  static async initiatePasswordReset(username) {
    try {
      const resetToken = await User.initiatePasswordReset(username);
      console.log(`Password reset token generated for user ${username}.`);
      // In a real application, you would send the reset token to the user's email here
      return resetToken;
    } catch (error) {
      console.error(`Password reset initiation failed: ${error.message}`);
      throw new Error('Failed to initiate password reset.');
    }
  }

  /**
   * @param {string} username username of the user resetting their password
   * @param {string} token password reset token
   * @param {string} newPassword the new password
   * @returns {Promise<void>}
   * @throws {Error}token is invalid, expired, or the process fails
   */
  static async resetPassword(username, token, newPassword) {
    try {
      await User.resetPassword(username, token, newPassword);
      console.log(`User ${username}'s password has been successfully reset.`);
    } catch (error) {
      console.error(`Password reset failed: ${error.message}`);
      throw new Error('Password reset failed.');
    }
  }
}