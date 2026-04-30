import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './register.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async register(dto: RegisterDto) {
    const { email, password } = dto;
    const salt = await bcrypt.genSalt();
    const password_hash = await bcrypt.hash(password, salt);

    try {
      const user = this.userRepository.create({ email, password_hash });
      await this.userRepository.save(user);
      return { message: 'User registered successfully' };
    } catch (error: unknown) {
      if (
        error &&
        typeof error === 'object' &&
        'code' in error &&
        error.code === '23505'
      ) {
        throw new ConflictException('Email exists');
      }
      throw error;
    }
  }
}
