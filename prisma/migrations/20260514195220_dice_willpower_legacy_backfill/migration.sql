-- DataMigration: traducir el flag legacy `willpowerSpent` al nuevo enum `willpowerEffect`.
-- Antes "willpowerSpent=true" significaba "gastó 1 punto para +1 éxito" (modo único viejo).
-- Esta migración solo afecta a tiradas existentes; nuevas filas usan los flags correctos.
UPDATE "dice_rolls"
   SET "willpowerEffect" = 'SUCCESS'
 WHERE "willpowerSpent" = TRUE
   AND "willpowerEffect" = 'NONE';
