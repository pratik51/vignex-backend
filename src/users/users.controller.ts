import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  NotFoundException 
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { DepositUserDto } from './dto/deposit-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // --- 1. LOGIN ENDPOINT ---
  @Post('login')
  async login(@Body() body: any) {
    const user = await this.usersService.login(body.email, body.password);
    if (!user) {
      throw new NotFoundException('Invalid Email or Password');
    }
    return user;
  }

  // --- 2. EXISTING ENDPOINTS ---
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }

  @Post(':id/deposit')
  deposit(@Param('id') id: string, @Body() depositDto: DepositUserDto) {
    return this.usersService.deposit(+id, depositDto.amount);
  }
}