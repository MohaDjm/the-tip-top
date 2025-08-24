-- Insert test user directly into the database
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
) VALUES (
    gen_random_uuid(),
    'test@thetiptop.fr',
    '$2b$12$LQv3c1yqBwEHXLAw98qDSO.hFzIFaVtUewOhXbgbgibTkj8S8PQxO', -- TestPassword123!
    'Jean',
    'Dupont',
    '1990-05-15'::date,
    '+33123456789',
    '123 Rue de la Paix',
    'Paris',
    '75001',
    'CLIENT',
    true,
    NOW(),
    NOW()
);

-- Insert admin user
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
) VALUES (
    gen_random_uuid(),
    'admin@thetiptop.fr',
    '$2b$12$LQv3c1yqBwEHXLAw98qDSO.hFzIFaVtUewOhXbgbgibTkj8S8PQxO', -- AdminPassword123!
    'Marie',
    'Martin',
    '1985-03-20'::date,
    '+33987654321',
    '456 Avenue des Champs',
    'Lyon',
    '69001',
    'ADMIN',
    true,
    NOW(),
    NOW()
);

-- Show the created users
SELECT id, email, "firstName", "lastName", role, "emailVerified", "createdAt" FROM "User" ORDER BY "createdAt" DESC;
