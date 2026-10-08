import { z } from "zod";

/** The open data JSON is converted from XML: every number is a string. */
const count = z
  .string()
  .regex(/^\d+$/)
  .transform((value) => Number(value));

const isoDate = z.iso.date();

/** XML→JSON conversion turns a single-element list into a plain object. */
const oneOrMany = <T extends z.ZodType>(item: T) => {
  return z.union([z.array(item), item]).transform((value) => (Array.isArray(value) ? value : [value]));
};

const voteCountSchema = z.object({
  pour: count,
  contre: count,
  abstentions: count,
  nonVotants: count,
  nonVotantsVolontaires: count,
});

const groupVoteSchema = z.object({
  organeRef: z.string().min(1),
  nombreMembresGroupe: count,
  vote: z.object({
    positionMajoritaire: z.enum(["pour", "contre", "abstention"]),
    decompteVoix: voteCountSchema,
  }),
});

/** One file of the "Scrutins" archive. Only the fields used by the shortlist are validated. */
export const rawScrutinSchema = z.object({
  scrutin: z.object({
    uid: z.string().min(1),
    numero: count,
    legislature: count,
    dateScrutin: isoDate,
    typeVote: z.object({
      codeTypeVote: z.string().min(1),
      libelleTypeVote: z.string().min(1),
    }),
    sort: z.object({ code: z.enum(["adopté", "rejeté"]) }),
    titre: z.string().min(1),
    ventilationVotes: z.object({
      organe: z.object({
        groupes: z.object({ groupe: oneOrMany(groupVoteSchema) }),
      }),
    }),
  }),
});

export type RawScrutin = z.infer<typeof rawScrutinSchema>;

/** One file of the AMO "organe" folder, restricted to parliamentary groups. */
export const rawGroupSchema = z.object({
  organe: z.object({
    uid: z.string().min(1),
    codeType: z.literal("GP"),
    libelle: z.string().min(1),
    libelleAbrev: z.string().min(1),
    legislature: count,
    viMoDe: z.object({
      dateDebut: isoDate,
      dateFin: isoDate.nullable(),
    }),
  }),
});

export type RawGroup = z.infer<typeof rawGroupSchema>;

/** Written by download.ts, read by shortlist.ts. */
export const retrievalSchema = z.object({
  legislature: z.number().int(),
  sources: z.array(
    z.object({
      id: z.enum(["scrutins", "organes"]),
      url: z.url(),
      retrievedAt: z.iso.datetime(),
      sha256: z.string().regex(/^[0-9a-f]{64}$/),
    }),
  ),
});

export type Retrieval = z.infer<typeof retrievalSchema>;

/** Written by shortlist.ts (output.ts), read by pool.ts. Only the fields used by the pool are validated. */
export const shortlistFileSchema = z.object({
  legislature: z.number().int(),
  sources: retrievalSchema.shape.sources,
  groups: z.array(
    z.object({
      ref: z.string().min(1),
      abbreviation: z.string().min(1),
      name: z.string().min(1),
    }),
  ),
  shortlist: z.array(
    z.object({
      number: z.number().int().positive(),
      uid: z.string().min(1),
      date: isoDate,
      title: z.string().min(1),
      sourceUrl: z.url(),
      groups: z.array(
        z.object({
          ref: z.string().min(1),
          for: z.number().int().nonnegative(),
          against: z.number().int().nonnegative(),
          abstention: z.number().int().nonnegative(),
          nonVoting: z.number().int().nonnegative(),
          absent: z.number().int().nonnegative(),
        }),
      ),
    }),
  ),
});

export type ShortlistFile = z.infer<typeof shortlistFileSchema>;
