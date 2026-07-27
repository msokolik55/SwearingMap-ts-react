import { randomUUID } from "node:crypto";

import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { PrismaGeospatialRepository } from "../geography/prisma-geospatial.repository";
import { createPrismaClient } from "./prisma-client";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
	throw new Error("DATABASE_URL is required for database integration tests.");
}

const prisma = createPrismaClient(databaseUrl);

describe("Prisma PostgreSQL integration", () => {
	beforeAll(async () => {
		await prisma.$connect();
	});

	afterAll(async () => {
		await prisma.$disconnect();
	});

	it("runs on PostgreSQL with PostGIS enabled", async () => {
		const [extension] = await prisma.$queryRaw<Array<{ version: string }>>`
			SELECT PostGIS_Version() AS version
		`;

		expect(extension?.version).toMatch(/^3\.5/u);
	});

	it("loads the deterministic multilingual seed exactly once", async () => {
		const [roleCount, languages, countries, words, equivalents] = await Promise.all([
			prisma.role.count(),
			prisma.language.findMany({ orderBy: { code: "asc" } }),
			prisma.country.findMany({ orderBy: { iso2: "asc" } }),
			prisma.swearWord.findMany({
				orderBy: { slug: "asc" },
				include: { meanings: true },
			}),
			prisma.translationEquivalent.findMany(),
		]);

		expect(roleCount).toBe(3);
		expect(languages.map(({ code }) => code)).toEqual(["en", "sk"]);
		expect(countries.map(({ iso2 }) => iso2)).toEqual(["SK", "US"]);
		expect(words).toHaveLength(2);
		expect(words.every(({ meanings }) => meanings.length === 1)).toBe(true);
		expect(equivalents).toHaveLength(1);
	});

	it("isolates parameterized PostGIS proximity queries behind a repository", async () => {
		const repository = new PrismaGeospatialRepository(prisma);

		const nearby = await repository.findCountriesNear(
			{ latitude: 48.1486, longitude: 17.1077 },
			50_000
		);

		expect(nearby).toHaveLength(1);
		expect(nearby[0]).toMatchObject({
			name: "Slovakia",
			slug: "slovakia",
		});
		expect(nearby[0]?.distanceMeters).toBeLessThan(1);
	});

	it("enforces the one-to-five intensity invariant in PostgreSQL", async () => {
		const userId = randomUUID();
		const word = await prisma.swearWord.findUniqueOrThrow({
			where: { id: "11659a14-7cf7-41a4-8171-435e27d84e8d" },
			select: { id: true },
		});
		await prisma.user.create({
			data: {
				id: userId,
				email: `database-test-${userId}@example.invalid`,
			},
		});

		try {
			await expect(
				prisma.intensityRating.create({
					data: { userId, swearWordId: word.id, value: 6 },
				})
			).rejects.toThrow();
		} finally {
			await prisma.user.delete({ where: { id: userId } });
		}
	});
});
