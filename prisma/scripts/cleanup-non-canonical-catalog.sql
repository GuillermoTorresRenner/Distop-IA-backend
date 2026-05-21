-- =============================================================================
-- cleanup-non-canonical-catalog.sql
-- =============================================================================
-- Limpieza idempotente del catálogo: borra de la BD los registros con nombres
-- antiguos / no canónicos que ya no existen en el vault, preservando los
-- referenciados por personajes (los migra antes de borrar).
--
-- Aplicar después de hacer deploy del backend con el vault actualizado y de
-- correr `npx prisma db seed` (que ya pobla los nuevos nombres canónicos).
--
-- Uso desde la VPS:
--
--   # QA
--   docker exec -i <contenedor-db-qa> \
--     psql -U <user> -d <db_qa> < cleanup-non-canonical-catalog.sql
--
--   # Producción
--   docker exec -i <contenedor-db-prod> \
--     psql -U <user> -d <db_prod> < cleanup-non-canonical-catalog.sql
--
-- Se ejecuta dentro de una transacción: si algo falla, no queda nada a medias.
-- Es 100% idempotente: correrlo varias veces no produce efectos adicionales
-- una vez aplicado.
-- =============================================================================

BEGIN;

-- -----------------------------------------------------------------------------
-- 1) Arquetipos no canónicos
-- -----------------------------------------------------------------------------
-- Antiguos nombres que se redirigieron a otro arquetipo canónico del manual
-- V20. Antes de borrar, migramos los personajes que los usen como Naturaleza
-- (`natureId`) o Conducta (`demeanorId`) al arquetipo canónico equivalente.
--
-- Mapeo:
--   Bon vivant   -> Vividor
--   Cabezota     -> Tradicionalista
--   Capullo      -> Bellaco
--   Caudillo     -> Visionario
--   Comodín      -> Bufón
--   Director     -> Hosco
--   Gamberro     -> Monstruo
--   Jueza        -> Juez
--   Lacayo       -> Mártir
--   Rufián       -> Competidor
--   Trotamundos  -> Protector
--   Vividor (parásito, definición antigua que coincide con Confabulador)
--                -> Confabulador
-- -----------------------------------------------------------------------------

DO $$
DECLARE
  mapping RECORD;
  old_id  uuid;
  new_id  uuid;
BEGIN
  FOR mapping IN
    SELECT * FROM (VALUES
      ('Bon vivant',   'Vividor'),
      ('Cabezota',     'Tradicionalista'),
      ('Capullo',      'Bellaco'),
      ('Caudillo',     'Visionario'),
      ('Comodín',      'Bufón'),
      ('Director',     'Hosco'),
      ('Gamberro',     'Monstruo'),
      ('Jueza',        'Juez'),
      ('Lacayo',       'Mártir'),
      ('Rufián',       'Competidor'),
      ('Trotamundos',  'Protector')
    ) AS t(old_name, new_name)
  LOOP
    SELECT id INTO old_id FROM archetypes WHERE name = mapping.old_name;
    SELECT id INTO new_id FROM archetypes WHERE name = mapping.new_name;

    IF old_id IS NOT NULL AND new_id IS NOT NULL THEN
      UPDATE characters SET "natureId"   = new_id WHERE "natureId"   = old_id;
      UPDATE characters SET "demeanorId" = new_id WHERE "demeanorId" = old_id;
      DELETE FROM archetypes WHERE id = old_id;
      RAISE NOTICE 'Arquetipo % migrado a % y eliminado.', mapping.old_name, mapping.new_name;
    ELSIF old_id IS NOT NULL THEN
      RAISE WARNING 'Arquetipo destino "%" no existe; "%" no se elimina (corre el seed primero).',
        mapping.new_name, mapping.old_name;
    END IF;
  END LOOP;
END$$;

-- -----------------------------------------------------------------------------
-- 2) Méritos / Defectos no canónicos
-- -----------------------------------------------------------------------------
-- Mapeo (antiguo -> canónico). character_merits_flaws.meritFlawId apunta al
-- registro; lo redirigimos al canónico antes de borrar el antiguo.
--
--   Buen oído            -> Sentido agudo
--   Cojo                 -> Cojera
--   Contactos            -> Sire prestigioso     (Contactos es Trasfondo, no Mérito)
--   Halo de la Bestia    -> Presencia inquietante
--   Inofensivo           -> Color saludable
--   Mala reputación      -> Sire infame
--   Pelaje espeso        -> Equilibrio felino
--   Reflejos felinos     -> Voz encantadora
--   Reputación           -> Deuda de gratitud
--   Sangre débil         -> Sangre diluida
--   Sangre fuerte        -> Invinculable
--   Sentido del tiempo   -> Sentido temporal
-- -----------------------------------------------------------------------------

DO $$
DECLARE
  mapping RECORD;
  old_id  uuid;
  new_id  uuid;
BEGIN
  FOR mapping IN
    SELECT * FROM (VALUES
      ('Buen oído',          'Sentido agudo'),
      ('Cojo',               'Cojera'),
      ('Contactos',          'Sire prestigioso'),
      ('Halo de la Bestia',  'Presencia inquietante'),
      ('Inofensivo',         'Color saludable'),
      ('Mala reputación',    'Sire infame'),
      ('Pelaje espeso',      'Equilibrio felino'),
      ('Reflejos felinos',   'Voz encantadora'),
      ('Reputación',         'Deuda de gratitud'),
      ('Sangre débil',       'Sangre diluida'),
      ('Sangre fuerte',      'Invinculable'),
      ('Sentido del tiempo', 'Sentido temporal')
    ) AS t(old_name, new_name)
  LOOP
    SELECT id INTO old_id FROM merits_flaws WHERE name = mapping.old_name;
    SELECT id INTO new_id FROM merits_flaws WHERE name = mapping.new_name;

    IF old_id IS NOT NULL AND new_id IS NOT NULL THEN
      UPDATE character_merits_flaws SET "meritFlawId" = new_id WHERE "meritFlawId" = old_id;
      DELETE FROM merits_flaws WHERE id = old_id;
      RAISE NOTICE 'Mérito/Defecto % migrado a % y eliminado.', mapping.old_name, mapping.new_name;
    ELSIF old_id IS NOT NULL THEN
      RAISE WARNING 'Destino "%" no existe; "%" no se elimina (corre el seed primero).',
        mapping.new_name, mapping.old_name;
    END IF;
  END LOOP;
END$$;

-- -----------------------------------------------------------------------------
-- 3) Habilidades no canónicas
-- -----------------------------------------------------------------------------
-- Estas habilidades existieron en versiones tempranas del vault pero no son
-- canónicas V20:
--   - Artesanía  (cubierta por Pericias)
--   - Burocracia (cubierta por Política / Finanzas según contexto)
--   - Conciencia (es una Virtud, no una Habilidad)
--   - Robo       (cubierto por Seguridad / Callejeo / Sigilo)
--
-- `character_abilities.name` es texto libre (no FK), así que solo borramos
-- las entradas del catálogo. Personajes con esas habilidades conservan su
-- nombre en la hoja; el front mostrará el texto sin descripción de catálogo,
-- y al editar podrá reasignarlas a las canónicas.
-- -----------------------------------------------------------------------------

DELETE FROM ability_info
WHERE name IN ('Artesanía', 'Burocracia', 'Conciencia', 'Robo');

-- -----------------------------------------------------------------------------
-- 4) Verificación final
-- -----------------------------------------------------------------------------
-- Conteos esperados tras correr el seed canónico:
--
--   atributos          =  9
--   habilidades        = 31
--   niveles_salud      =  7
--   arquetipos         = 30
--   meritos_defectos   = 51
--   trasfondos         = 10
--   clanes             = 14
--   virtudes           =  5
--   disciplinas        = 12
--   discipline_paths   =  8
--   discipline_powers  = 90
--   discipline_rituals = 16
-- -----------------------------------------------------------------------------

DO $$
DECLARE
  n_arch INT;
  n_mf   INT;
  n_abi  INT;
BEGIN
  SELECT COUNT(*) INTO n_arch FROM archetypes;
  SELECT COUNT(*) INTO n_mf   FROM merits_flaws;
  SELECT COUNT(*) INTO n_abi  FROM ability_info;

  RAISE NOTICE '--- Conteo final ---';
  RAISE NOTICE 'archetypes:   % (esperado 30)', n_arch;
  RAISE NOTICE 'merits_flaws: % (esperado 51)', n_mf;
  RAISE NOTICE 'ability_info: % (esperado 31)', n_abi;

  IF n_arch <> 30 OR n_mf <> 51 OR n_abi <> 31 THEN
    RAISE WARNING 'Los conteos no coinciden con lo esperado. Verifica que el seed canónico haya corrido antes de este script.';
  ELSE
    RAISE NOTICE 'OK: catálogo alineado con el vault canónico.';
  END IF;
END$$;

COMMIT;
