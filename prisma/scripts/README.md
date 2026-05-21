# Scripts de mantenimiento

Scripts SQL para mantenimiento operativo de las BDs de QA y producción. Pensados
para correr puntualmente desde la VPS, después de un deploy que cambie el
catálogo del vault.

## `cleanup-non-canonical-catalog.sql`

Limpia registros del catálogo con nombres antiguos (no canónicos V20) que ya no
existen en el vault, migrando antes los datos de personajes que los referencien.

### Cuándo usarlo

Tras hacer push a `QA` o `main` de un cambio en `prisma/vault/` que renombra
arquetipos, méritos/defectos o habilidades. El seed automático del CI (`npx
prisma db seed`) crea los nuevos nombres canónicos pero **no borra** los
antiguos (para evitar destruir datos en juego). Este script se ocupa de la
parte que el seed no hace.

Es **idempotente**: correrlo varias veces no causa problemas.

### Cómo ejecutarlo

#### En QA

```bash
ssh deployer@<vps>
docker exec -i <contenedor-db-qa> psql -U <user> -d <db_qa> \
  < /home/deployer/proyectos/distop-ia/qa/back/prisma/scripts/cleanup-non-canonical-catalog.sql
```

#### En producción

```bash
ssh deployer@<vps>
docker exec -i <contenedor-db-prod> psql -U <user> -d <db_prod> \
  < /home/deployer/proyectos/distop-ia/prod/back/prisma/scripts/cleanup-non-canonical-catalog.sql
```

Reemplaza:

- `<contenedor-db-qa>` / `<contenedor-db-prod>` por el nombre real (ej.
  `distop_ia_qa-db-1`).
- `<user>` por el `POSTGRES_USER` del `.env` correspondiente.
- `<db_qa>` / `<db_prod>` por el `DB_NAME`.

### Qué hace exactamente

1. **Arquetipos**: migra `natureId` y `demeanorId` de personajes que usen
   nombres antiguos al arquetipo canónico equivalente y elimina los antiguos.

2. **Méritos/Defectos**: migra `character_merits_flaws.meritFlawId` al
   registro canónico y elimina los antiguos.

3. **Habilidades**: elimina entradas del catálogo no canónicas (Artesanía,
   Burocracia, Conciencia, Robo). Como `character_abilities.name` es texto
   libre (no FK), los personajes conservan el nombre en su hoja; al editar
   pueden reasignarlas a las canónicas.

4. **Verificación**: imprime conteos esperados y advierte si no coinciden.

Toda la operación va dentro de una transacción (`BEGIN`/`COMMIT`). Si algo
falla, no queda nada a medias.

### Mapeo aplicado

#### Arquetipos

| Antiguo | Canónico V20 |
|---|---|
| Bon vivant | Vividor |
| Cabezota | Tradicionalista |
| Capullo | Bellaco |
| Caudillo | Visionario |
| Comodín | Bufón |
| Director | Hosco |
| Gamberro | Monstruo |
| Jueza | Juez |
| Lacayo | Mártir |
| Rufián | Competidor |
| Trotamundos | Protector |

#### Méritos / Defectos

| Antiguo | Canónico V20 |
|---|---|
| Buen oído | Sentido agudo |
| Cojo | Cojera |
| Contactos | Sire prestigioso |
| Halo de la Bestia | Presencia inquietante |
| Inofensivo | Color saludable |
| Mala reputación | Sire infame |
| Pelaje espeso | Equilibrio felino |
| Reflejos felinos | Voz encantadora |
| Reputación | Deuda de gratitud |
| Sangre débil | Sangre diluida |
| Sangre fuerte | Invinculable |
| Sentido del tiempo | Sentido temporal |

#### Habilidades (sin reemplazo, eliminadas)

- Artesanía (cubierta por Pericias)
- Burocracia (cubierta por Política / Finanzas)
- Conciencia (es una Virtud, no una Habilidad)
- Robo (cubierto por Seguridad / Callejeo / Sigilo)
