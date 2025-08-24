-- Create test users directly in PostgreSQL
-- Password hash for 'TestPassword123!' using bcrypt with salt rounds 12
-- You can generate this with: node -e "console.log(require('bcrypt').hashSync('TestPassword123!', 12))"

INSERT INTO "User" (
    id,
    email,
    password,
    "firstName",
    "lastName",
    "dateOfBirth",
    phone,
    address,
    city,
    "postalCode",
    role,
    "emailVerified",
    "createdAt",
    "updatedAt"
) VALUES 
(
    gen_random_uuid(),
    'test@thetiptop.fr',
    '$2b$12$LQv3c1yqBwEHXLAw98qDSO.hFzIFaVtUewOhXbgbgibTkj8S8PQxO',
    'Jean',
    'Dupont',
    '1990-05-15'::timestamp,
    '+33123456789',
    '123 Rue de la Paix',
    'Paris',
    '75001',
    'CLIENT'::role,
    true,
    NOW(),
    NOW()
),
(
    gen_random_uuid(),
    'admin@thetiptop.fr',
    '$2b$12$LQv3c1yqBwEHXLAw98qDSO.hFzIFaVtUewOhXbgbgibTkj8S8PQxO',
    'Marie',
    'Martin',
    '1985-03-20'::timestamp,
    '+33987654321',
    '456 Avenue des Champs',
    'Lyon',
    '69001',
    'ADMIN'::role,
    true,
    NOW(),
    NOW()
)
ON CONFLICT (email) DO NOTHING;

-- Verify users were created
SELECT 
    id,
    email,
    "firstName",
    "lastName",
    role,
    "emailVerified",
    "createdAt"
FROM "User" 
ORDER BY "createdAt" DESC;
