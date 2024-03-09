// user.js
import { query } from './database.js';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

class User {
  /**
   * @param {Object} userDetails - username and password
   * @returns {Promise<Object>} - id and username
   * @throws {Error} - Throws an error if the username is already taken 
   */
  static async create({ username, password }) {
    // Validate username and password
    if (!username || !password) {
      console.error("Validation Error: Username and password are required.");
      throw new Error('Username and password are required.');
    }
  
    try {
      const hashedPassword = await bcrypt.hash(password, 12);
      const result = await query(
        'INSERT INTO users (username, password) VALUES (?, ?)',
        [username, hashedPassword]
      );
      console.log(`User ${username} created successfully.`);
      return { id: result.insertId, username };
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        console.error(`Error: The username "${username}" is already taken.`);
        throw new Error('Username is already taken.');
      }
      console.error(`Database Error: ${error.message}`);
      throw new Error('Failed to create user.');
    }
  }

  /**
   * Finds a user by username
   * @param {string} username - username of the user to find
   * @returns {Promise<Object>} - found user object
   * @throws {Error} - user not found or database error
   */
  static async findByUsername(username) {
    try {
      const users = await query('SELECT * FROM users WHERE username = ?', [username]);
      if (users.length === 0) {
        console.error(`Error: User "${username}" not found.`);
        throw new Error('User not found.');
      }
      return users[0];
    } catch (error) {
      console.error(`Database Error: ${error.message}`);
      throw new Error('Failed to find user.');
    }
  }

  /**
   * Compares a candidate password with the stored hash
   * @param {string} candidatePassword - The password to compare
   * @param {string} hash - The stored hash to compare against
   * @returns {Promise<boolean>} - True if the password matches, false otherwise
   */
  static async comparePassword(candidatePassword, hash) {
    try {
      return await bcrypt.compare(candidatePassword, hash);
    } catch (error) {
      console.error(`Error comparing passwords: ${error.message}`);
      throw new Error('Password comparison failed.');
    }
  }

  static async initiatePasswordReset(username) {
    const user = await this.findByUsername(username);
    const resetToken = crypto.randomBytes(20).toString('hex');
    const tokenHash = await bcrypt.hash(resetToken, 12);
    
    try {
      await query(
        'UPDATE users SET resetToken = ?, resetTokenExpire = ? WHERE id = ?',
        [tokenHash, new Date(Date.now() + 3600000), user.id] // Token expires in 1 hour
      );
      console.log(`Password reset token generated for user ${username}.`);
      return resetToken;
    } catch (error) {
      console.error(`Database Error: ${error.message}`);
      throw new Error('Failed to initiate password reset.');
    }
  }

  /**
   * Resets the password 
   * @param {string} username - username of the user resetting their password
   * @param {string} token - the reset token provided to the user
   * @param {string} newPassword - the new password for the user
   * @returns {Promise<void>}
   * @throws {Error} - reset token is invalid, expired
   */
  static async resetPassword(username, token, newPassword) {
    const user = await this.findByUsername(username);

    if (!user.resetToken || new Date() > user.resetTokenExpire) {
      console.error("Error: Reset token is missing, used, or expired.");
      throw new Error('Reset token is invalid or expired.');
    }
    
    const tokenIsValid = await bcrypt.compare(token, user.resetToken);
    if (!tokenIsValid) {
      console.error("Error: Invalid reset token.");
      throw new Error('Invalid reset token.');
    }

    try {
      const hashedNewPassword = await bcrypt.hash(newPassword, 12);
      await query(
        'UPDATE users SET password = ?, resetToken = NULL, resetTokenExpire = NULL WHERE id = ?',
        [hashedNewPassword, user.id]
      );
      console.log(`User ${username}'s password has been reset successfully.`);
    } catch (error) {
      console.error(`Database Error: ${error.message}`);
      throw new Error('Failed to reset password.');
    }
  }
}

export { User };