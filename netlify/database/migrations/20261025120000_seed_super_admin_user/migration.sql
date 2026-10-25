INSERT INTO "user" ("id", "name", "email", "emailVerified", "createdAt", "updatedAt")
VALUES ('6b68d247a8aa4877b6069aee58da0652', 'Arpanet', 'arpanet@gmail.com', true, now(), now())
ON CONFLICT ("email") DO NOTHING;
--> statement-breakpoint
INSERT INTO "account" ("id", "accountId", "providerId", "userId", "password", "createdAt", "updatedAt")
SELECT 'fe48cc52385e46bbb4bcd1280542ce49', u."id", 'credential', u."id", 'cd508e72595a87afab8d3852716e4749:616c14db54e0197ca52adf50d7f0ace39e1fdba785e047e60d4710b34d9f5313add14fb152a2249c562c2c4b05105d2eca23a9a11952ff71235d93aa53577821', now(), now()
FROM "user" u
WHERE u."email" = 'arpanet@gmail.com'
  AND NOT EXISTS (SELECT 1 FROM "account" a WHERE a."userId" = u."id" AND a."providerId" = 'credential');
