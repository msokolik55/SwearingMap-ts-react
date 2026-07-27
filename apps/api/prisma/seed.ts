import { ContentStatus, RoleKey } from "../src/generated/prisma/enums";
import { createPrismaClient } from "../src/app/database/prisma-client";
import { resolveDatabaseUrl } from "../src/app/database/database-url";

const prisma = createPrismaClient(resolveDatabaseUrl());

const ids = {
	english: "1c34df96-b6aa-46d5-a9a9-5eb4637e0d8b",
	slovak: "e593f67a-1a66-4ba5-b6d7-c376ff539c62",
	slovakia: "317f17dc-1e9d-4672-98f5-85da6aa70c13",
	unitedStates: "918ace5c-527a-45f5-90fe-e5f92bf9ad49",
	damn: "11659a14-7cf7-41a4-8171-435e27d84e8d",
	doKelu: "f8e654f8-3b77-4d59-b76e-e845e56be820",
} as const;

async function seedRoles(): Promise<void> {
	const roles = [
		{ key: RoleKey.USER, description: "Standard authenticated user" },
		{ key: RoleKey.MODERATOR, description: "Content moderator" },
		{ key: RoleKey.ADMIN, description: "Platform administrator" },
	];

	for (const role of roles) {
		await prisma.role.upsert({
			where: { key: role.key },
			update: { description: role.description },
			create: role,
		});
	}
}

async function seedReferenceData(): Promise<void> {
	const english = await prisma.language.upsert({
		where: { code: "en" },
		update: { active: true, name: "English", nativeName: "English" },
		create: {
			id: ids.english,
			code: "en",
			name: "English",
			nativeName: "English",
		},
	});
	const slovak = await prisma.language.upsert({
		where: { code: "sk" },
		update: { active: true, name: "Slovak", nativeName: "Slovenčina" },
		create: {
			id: ids.slovak,
			code: "sk",
			name: "Slovak",
			nativeName: "Slovenčina",
		},
	});
	const slovakia = await prisma.country.upsert({
		where: { iso2: "SK" },
		update: { iso3: "SVK", name: "Slovakia", slug: "slovakia" },
		create: {
			id: ids.slovakia,
			iso2: "SK",
			iso3: "SVK",
			name: "Slovakia",
			slug: "slovakia",
		},
	});
	const unitedStates = await prisma.country.upsert({
		where: { iso2: "US" },
		update: {
			iso3: "USA",
			name: "United States",
			slug: "united-states",
		},
		create: {
			id: ids.unitedStates,
			iso2: "US",
			iso3: "USA",
			name: "United States",
			slug: "united-states",
		},
	});

	await prisma.$executeRaw`
		UPDATE "countries"
		SET "map_center" = ST_SetSRID(ST_MakePoint(17.1077, 48.1486), 4326)::geography
		WHERE "id" = ${slovakia.id}::uuid
	`;
	await prisma.$executeRaw`
		UPDATE "countries"
		SET "map_center" = ST_SetSRID(ST_MakePoint(-98.5795, 39.8283), 4326)::geography
		WHERE "id" = ${unitedStates.id}::uuid
	`;

	await prisma.countryLanguage.upsert({
		where: {
			countryId_languageId: {
				countryId: slovakia.id,
				languageId: slovak.id,
			},
		},
		update: { primary: true },
		create: {
			countryId: slovakia.id,
			languageId: slovak.id,
			primary: true,
		},
	});
	await prisma.countryLanguage.upsert({
		where: {
			countryId_languageId: {
				countryId: unitedStates.id,
				languageId: english.id,
			},
		},
		update: { primary: true },
		create: {
			countryId: unitedStates.id,
			languageId: english.id,
			primary: true,
		},
	});
}

async function seedSampleContent(): Promise<void> {
	await prisma.swearWord.upsert({
		where: { id: ids.damn },
		update: {
			editorialIntensity: 2,
			status: ContentStatus.PUBLISHED,
		},
		create: {
			id: ids.damn,
			languageId: ids.english,
			countryId: ids.unitedStates,
			term: "damn",
			normalizedTerm: "damn",
			slug: "damn",
			status: ContentStatus.PUBLISHED,
			editorialIntensity: 2,
			meanings: {
				create: {
					definition:
						"A mild exclamation used to express annoyance or disappointment.",
				},
			},
		},
	});
	await prisma.swearWord.upsert({
		where: { id: ids.doKelu },
		update: {
			editorialIntensity: 2,
			status: ContentStatus.PUBLISHED,
		},
		create: {
			id: ids.doKelu,
			languageId: ids.slovak,
			countryId: ids.slovakia,
			term: "do kelu",
			normalizedTerm: "do kelu",
			slug: "do-kelu",
			status: ContentStatus.PUBLISHED,
			editorialIntensity: 2,
			meanings: {
				create: {
					definition:
						"A mild Slovak exclamation expressing frustration or surprise.",
				},
			},
		},
	});
	await prisma.translationEquivalent.upsert({
		where: {
			sourceWordId_targetWordId: {
				sourceWordId: ids.doKelu,
				targetWordId: ids.damn,
			},
		},
		update: {
			confidence: 0.7,
			notes: "Approximate pragmatic equivalent; context changes intensity.",
			status: ContentStatus.PUBLISHED,
		},
		create: {
			sourceWordId: ids.doKelu,
			targetWordId: ids.damn,
			confidence: 0.7,
			notes: "Approximate pragmatic equivalent; context changes intensity.",
			status: ContentStatus.PUBLISHED,
		},
	});
}

async function main(): Promise<void> {
	await seedRoles();
	await seedReferenceData();
	await seedSampleContent();
}

void main()
	.then(() => {
		console.log("Deterministic database seed completed.");
	})
	.catch((error: unknown) => {
		console.error(error);
		process.exitCode = 1;
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
