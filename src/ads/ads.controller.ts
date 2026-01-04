import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AdsService } from './ads.service';
import { CreateAdDto } from './dto/create-ad.dto';

@Controller('ads')
export class AdsController {
  constructor(private readonly adsService: AdsService) {}

  @Post()
  create(@Body() createAdDto: CreateAdDto) {
    return this.adsService.create(createAdDto);
  }

  @Get()
  findAll() {
    return this.adsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.adsService.findOne(+id);
  }

  // --- NEW ENDPOINTS ---

  @Get('my-ads/:userId')
  findMyAds(@Param('userId') userId: string) {
    return this.adsService.findMyAds(+userId);
  }

  @Patch(':id/toggle')
  toggleStatus(@Param('id') id: string, @Body('userId') userId: number) {
    return this.adsService.toggleStatus(+id, userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Body('userId') userId: number) {
    // Note: Some clients send body in DELETE via specific config, 
    // but standard REST often uses query or auth headers. 
    // For this setup, ensure your frontend sends 'data' in the axios delete config.
    return this.adsService.remove(+id, userId);
  }
}