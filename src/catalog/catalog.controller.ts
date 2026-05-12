import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Auth } from '../common/decorators';
import { CatalogService } from './catalog.service';

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
}
