import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const newUser = this.usersRepository.create(createUserDto);
    return await this.usersRepository.save(newUser);
  }

  findAll() {
    return this.usersRepository.find();
  }

  findOne(id: number) {
    return this.usersRepository.findOneBy({ id });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    return await this.usersRepository.update(id, updateUserDto);
  }

  async remove(id: number) {
    return await this.usersRepository.delete(id);
  }

  // --- NEW: THE DEPOSIT FUNCTION ---
  async deposit(id: number, amount: number) {
    const user = await this.usersRepository.findOneBy({ id });
    if (!user) throw new NotFoundException('User not found');

    // FIX: If balance is missing/broken, treat it as 0
    let currentBalance = Number(user.usdtBalance);
    if (isNaN(currentBalance)) {
        currentBalance = 0;
    }

    const depositAmount = Number(amount);
    user.usdtBalance = currentBalance + depositAmount;
    
    // Force saving it as a clean number
    return await this.usersRepository.save(user);
  }
  async login(email: string, pass: string) {
    // 1. Find user by email
    const user = await this.usersRepository.findOneBy({ email });
    
    // 2. Check password (Simple check for now)
    if (user && user.password === pass) {
      return user;
    }
    return null;
  }
}
