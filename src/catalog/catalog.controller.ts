import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Auth, GetUser } from '../common/decorators';
import { CatalogService } from './catalog.service';
import { CreateArmorDto, UpdateArmorDto } from './dto/armor.dto';
import { CreateWeaponDto, UpdateWeaponDto } from './dto/weapon.dto';

@ApiTags('Catalog')
@Controller('catalog')
export class CatalogController {
  constructor(private readonly catalog: CatalogService) {}

  @Get('archetypes')
  @Auth()
  @ApiOperation({ summary: 'Archetypes used for Nature and Demeanor' })
  archetypes() {
    return this.catalog.listArchetypes();
  }

  @Get('disciplines')
  @Auth()
  @ApiOperation({ summary: 'Disciplines with nested powers per level (1..5)' })
  disciplines() {
    return this.catalog.listDisciplines();
  }

  @Get('merits-flaws')
  @Auth()
  @ApiOperation({ summary: 'Catalog of merits and flaws' })
  meritsFlaws() {
    return this.catalog.listMeritsFlaws();
  }

  @Get('clans')
  @Auth()
  @ApiOperation({ summary: 'Clans and bloodlines' })
  clans() {
    return this.catalog.listClans();
  }

  // ── Equipo ──

  @Get('weapon-categories')
  @Auth()
  @ApiOperation({ summary: 'Weapon categories (Porra, Fusil, …) ordered by kind' })
  weaponCategories() {
    return this.catalog.listWeaponCategories();
  }

  @Get('weapons')
  @Auth()
  @ApiOperation({
    summary: 'System weapons (V20 manual) + the caller\'s custom weapons',
  })
  weapons(@GetUser('id') userId: string) {
    return this.catalog.listWeapons(userId);
  }

  @Post('weapons')
  @Auth()
  @ApiOperation({ summary: 'Create a custom weapon owned by the caller' })
  createWeapon(@GetUser('id') userId: string, @Body() dto: CreateWeaponDto) {
    return this.catalog.createWeapon(userId, dto);
  }

  @Patch('weapons/:id')
  @Auth()
  @ApiOperation({ summary: 'Update a custom weapon (owner only)' })
  updateWeapon(
    @Param('id') id: string,
    @GetUser('id') userId: string,
    @Body() dto: UpdateWeaponDto,
  ) {
    return this.catalog.updateWeapon(id, userId, dto);
  }

  @Delete('weapons/:id')
  @Auth()
  @ApiOperation({ summary: 'Delete a custom weapon (must be unused)' })
  deleteWeapon(@Param('id') id: string, @GetUser('id') userId: string) {
    return this.catalog.deleteWeapon(id, userId);
  }

  @Get('armors')
  @Auth()
  @ApiOperation({
    summary: 'System armors (V20 manual) + the caller\'s custom armors',
  })
  armors(@GetUser('id') userId: string) {
    return this.catalog.listArmors(userId);
  }

  @Post('armors')
  @Auth()
  @ApiOperation({ summary: 'Create a custom armor owned by the caller' })
  createArmor(@GetUser('id') userId: string, @Body() dto: CreateArmorDto) {
    return this.catalog.createArmor(userId, dto);
  }

  @Patch('armors/:id')
  @Auth()
  @ApiOperation({ summary: 'Update a custom armor (owner only)' })
  updateArmor(
    @Param('id') id: string,
    @GetUser('id') userId: string,
    @Body() dto: UpdateArmorDto,
  ) {
    return this.catalog.updateArmor(id, userId, dto);
  }

  @Delete('armors/:id')
  @Auth()
  @ApiOperation({ summary: 'Delete a custom armor (must be unused)' })
  deleteArmor(@Param('id') id: string, @GetUser('id') userId: string) {
    return this.catalog.deleteArmor(id, userId);
  }
}
