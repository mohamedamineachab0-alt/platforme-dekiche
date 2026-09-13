// Wilaya data — 58 Algerian provinces (W01–W58)
export const WILAYAS: { code: string; name: string }[] = [
  { code: "W01", name: "أدرار" },
  { code: "W02", name: "الشلف" },
  { code: "W03", name: "الأغواط" },
  { code: "W04", name: "أم البواقي" },
  { code: "W05", name: "باتنة" },
  { code: "W06", name: "بجاية" },
  { code: "W07", name: "بسكرة" },
  { code: "W08", name: "بشار" },
  { code: "W09", name: "البليدة" },
  { code: "W10", name: "البويرة" },
  { code: "W11", name: "تمنراست" },
  { code: "W12", name: "تبسة" },
  { code: "W13", name: "تلمسان" },
  { code: "W14", name: "تيارت" },
  { code: "W15", name: "تيزي وزو" },
  { code: "W16", name: "الجزائر" },
  { code: "W17", name: "الجلفة" },
  { code: "W18", name: "جيجل" },
  { code: "W19", name: "سطيف" },
  { code: "W20", name: "سعيدة" },
  { code: "W21", name: "سكيكدة" },
  { code: "W22", name: "سيدي بلعباس" },
  { code: "W23", name: "عنابة" },
  { code: "W24", name: "قالمة" },
  { code: "W25", name: "قسنطينة" },
  { code: "W26", name: "المدية" },
  { code: "W27", name: "مستغانم" },
  { code: "W28", name: "المسيلة" },
  { code: "W29", name: "معسكر" },
  { code: "W30", name: "ورقلة" },
  { code: "W31", name: "وهران" },
  { code: "W32", name: "البيض" },
  { code: "W33", name: "إليزي" },
  { code: "W34", name: "برج بوعريريج" },
  { code: "W35", name: "بومرداس" },
  { code: "W36", name: "الطارف" },
  { code: "W37", name: "تندوف" },
  { code: "W38", name: "تيسمسيلت" },
  { code: "W39", name: "الوادي" },
  { code: "W40", name: "خنشلة" },
  { code: "W41", name: "سوق أهراس" },
  { code: "W42", name: "تيبازة" },
  { code: "W43", name: "ميلة" },
  { code: "W44", name: "عين الدفلى" },
  { code: "W45", name: "النعامة" },
  { code: "W46", name: "عين تموشنت" },
  { code: "W47", name: "غرداية" },
  { code: "W48", name: "غليزان" },
  { code: "W49", name: "تيميمون" },
  { code: "W50", name: "برج باجي مختار" },
  { code: "W51", name: "أولاد جلال" },
  { code: "W52", name: "بني عباس" },
  { code: "W53", name: "عين صالح" },
  { code: "W54", name: "عين قزام" },
  { code: "W55", name: "تقرت" },
  { code: "W56", name: "جانت" },
  { code: "W57", name: "المغير" },
  { code: "W58", name: "المنيعة" },
];

export const getWilayaName = (code?: string | null) => {
  if (!code) return "";
  const wilaya = WILAYAS.find(w => w.code === code);
  return wilaya ? wilaya.name : code;
};

export const SECONDARY_STREAMS = [
  { value: "COMMON_TRUNK", label: "جذع مشترك (أولى ثانوي)" },
  { value: "SCIENCES", label: "شعبة علوم تجريبية" },
  { value: "MATH", label: "شعبة رياضيات" },
  { value: "TECH_MATH", label: "شعبة تقني رياضي" },
  { value: "GESTION", label: "شعبة تسيير واقتصاد" },
  { value: "LETTRES", label: "شعبة آداب وفلسفة" },
  { value: "LANGUAGES", label: "شعبة لغات أجنبية" },
];

export const PRIMARY_STREAMS = [{ value: "PRIMARY", label: "عام" }];

export const MIDDLE_STREAMS = [
  { value: "COMMON_TRUNK", label: "جذع مشترك" },
  { value: "MIDDLE_SCIENCE", label: "علمي" },
  { value: "MIDDLE_LETTERS", label: "أدبي" },
];

export const TRAINING_STREAMS = [
  { value: "PROGRAMMING", label: "البرمجة" },
  { value: "ROBOTICS", label: "الروبوتات" },
  { value: "ART", label: "الرسم" },
  { value: "DESIGN", label: "التصميم" },
  { value: "VIDEO", label: "المونتاج وصناعة المحتوى" },
  { value: "CHESS", label: "الشطرنج" },
  { value: "MUSIC", label: "الموسيقى" },
  { value: "CALLIGRAPHY", label: "الخط العربي" },
  { value: "THEATER", label: "المسرح والإلقاء" },
  { value: "COMPUTER", label: "الإعلام الآلي" },
  { value: "ACCOUNTING", label: "المحاسبة" },
  { value: "OFFICE", label: "السكرتارية" },
];

export const CYCLES = [
  {
    value: "PRIMARY",
    label: "الطور الابتدائي",
    levels: [
      { value: "AP1", label: "السنة الأولى ابتدائي" },
      { value: "AP2", label: "السنة الثانية ابتدائي" },
      { value: "AP3", label: "السنة الثالثة ابتدائي" },
      { value: "AP4", label: "السنة الرابعة ابتدائي" },
      { value: "AP5", label: "السنة الخامسة ابتدائي" },
    ],
    streams: PRIMARY_STREAMS,
  },
  {
    value: "MIDDLE",
    label: "الطور المتوسط",
    levels: [
      { value: "AM1", label: "السنة الأولى متوسط" },
      { value: "AM2", label: "السنة الثانية متوسط" },
      { value: "AM3", label: "السنة الثالثة متوسط" },
      { value: "AM4", label: "السنة الرابعة متوسط" },
    ],
    streams: MIDDLE_STREAMS,
  },
  {
    value: "SECONDARY",
    label: "الطور الثانوي",
    levels: [
      { value: "AS1", label: "السنة الأولى ثانوي" },
      { value: "AS2", label: "السنة الثانية ثانوي" },
      { value: "AS3", label: "السنة الثالثة ثانوي (شهادة الباكالوريا)" },
    ],
    streams: SECONDARY_STREAMS,
  },
  {
    value: "LANGUAGES",
    label: "تعليم اللغات",
    levels: [
      { value: "LANG_BEGINNER", label: "مبتدئ" },
      { value: "LANG_INTERMEDIATE", label: "متوسط" },
      { value: "LANG_ADVANCED", label: "متقدم" },
    ],
    streams: [
      { value: "ENGLISH", label: "الإنجليزية" },
      { value: "FRENCH", label: "الفرنسية" },
      { value: "SPANISH", label: "الإسبانية" },
    ],
  },
  {
    value: "SOROBAN",
    label: "السوروبان",
    levels: [
      { value: "SOR_BEGINNER", label: "مبتدئ" },
      { value: "SOR_INTERMEDIATE", label: "متوسط" },
      { value: "SOR_ADVANCED", label: "متقدم" },
    ],
    streams: [{ value: "SOROBAN", label: "السوروبان" }],
  },
  {
    value: "QURAN",
    label: "القرآن الكريم",
    levels: [
      { value: "QUR_BEGINNER", label: "مبتدئ" },
      { value: "QUR_INTERMEDIATE", label: "متوسط" },
      { value: "QUR_ADVANCED", label: "متقدم" },
    ],
    streams: [{ value: "QURAN", label: "القرآن الكريم" }],
  },
  {
    value: "ISLAMIC",
    label: "إسلاميات",
    levels: [
      { value: "ISL_BEGINNER", label: "مبتدئ" },
      { value: "ISL_INTERMEDIATE", label: "متوسط" },
      { value: "ISL_ADVANCED", label: "متقدم" },
    ],
    streams: [{ value: "ISLAMIC", label: "إسلاميات" }],
  },
  {
    value: "TRAINING",
    label: "دورات أخرى",
    levels: [
      { value: "TR_BEGINNER", label: "مبتدئ" },
      { value: "TR_INTERMEDIATE", label: "متوسط" },
      { value: "TR_ADVANCED", label: "متقدم" },
    ],
    streams: TRAINING_STREAMS,
  },
] as const;

export type CycleValue = (typeof CYCLES)[number]["value"];

export const LANGUAGE_CYCLE = CYCLES.find((cycle) => cycle.value === "LANGUAGES")!;
export const SOROBAN_CYCLE = CYCLES.find((cycle) => cycle.value === "SOROBAN")!;
export const QURAN_CYCLE = CYCLES.find((cycle) => cycle.value === "QURAN")!;
export const ISLAMIC_CYCLE = CYCLES.find((cycle) => cycle.value === "ISLAMIC")!;
export const TRAINING_CYCLE = CYCLES.find((cycle) => cycle.value === "TRAINING")!;
export const SECONDARY_CYCLE = CYCLES.find((cycle) => cycle.value === "SECONDARY")!;
export const MIDDLE_CYCLE = CYCLES.find((cycle) => cycle.value === "MIDDLE")!;
export const PRIMARY_CYCLE = CYCLES.find((cycle) => cycle.value === "PRIMARY")!;
export const STUDY_CYCLES = [PRIMARY_CYCLE, MIDDLE_CYCLE, SECONDARY_CYCLE];

export const LEVELS = CYCLES.flatMap((cycle) => [...cycle.levels]);

export const STREAMS = [
  ...PRIMARY_STREAMS,
  ...SECONDARY_STREAMS,
  ...MIDDLE_STREAMS,
  { value: "ENGLISH", label: "الإنجليزية" },
  { value: "FRENCH", label: "الفرنسية" },
  { value: "SPANISH", label: "الإسبانية" },
  { value: "SOROBAN", label: "السوروبان" },
  { value: "QURAN", label: "القرآن الكريم" },
  { value: "ISLAMIC", label: "إسلاميات" },
  ...TRAINING_STREAMS,
];

export function getCycleByValue(cycle?: string | null) {
  return CYCLES.find((item) => item.value === cycle);
}

export function getCycleByLevel(level?: string | null) {
  const matched = CYCLES.find((cycle) => cycle.levels.some((item) => item.value === level));
  if (matched) return matched;
  if (level?.startsWith("ENG_") || level?.startsWith("FR_") || level?.startsWith("ES_") || level?.startsWith("LANG_")) {
    return CYCLES.find((cycle) => cycle.value === "LANGUAGES");
  }
  if (level?.startsWith("SOR_")) {
    return CYCLES.find((cycle) => cycle.value === "SOROBAN");
  }
  if (level?.startsWith("QUR_")) {
    return CYCLES.find((cycle) => cycle.value === "QURAN");
  }
  if (level?.startsWith("ISL_")) {
    return CYCLES.find((cycle) => cycle.value === "ISLAMIC");
  }
  if (level?.startsWith("AP")) {
    return CYCLES.find((cycle) => cycle.value === "PRIMARY");
  }
  if (level?.startsWith("TR_")) {
    return CYCLES.find((cycle) => cycle.value === "TRAINING");
  }
  return undefined;
}

export function getCycleLabelForLevel(level?: string | null) {
  return getCycleByLevel(level)?.label || "";
}

export function isStreamAllowedForLevel(level?: string | null, stream?: string | null) {
  if (!level || !stream) return false;
  const cycle = getCycleByLevel(level);
  return !!cycle?.streams.some((item) => item.value === stream);
}

import type { Level, Prisma, Stream } from "@/generated/prisma";

export function cycleLevelValues(level?: string | null): Level[] {
  return (getCycleByLevel(level)?.levels.map((item) => item.value) ?? []) as Level[];
}

export function subjectAudienceWhere(level: string, stream: string): Prisma.SubjectWhereInput {
  const levelEnum = level as Level;
  const streamEnum = stream as Stream;
  const cycle = getCycleByLevel(level);
  const cycleLevels = cycleLevelValues(level);
  const allowSharedStreams = cycle?.value === "SECONDARY" || cycle?.value === "MIDDLE";

  return {
    AND: [
      { OR: [{ level: levelEnum }, { levels: { has: levelEnum } }] },
      {
        OR: [
          { stream: streamEnum },
          { streams: { has: streamEnum } },
          ...(allowSharedStreams && cycleLevels.length
            ? [
                {
                  AND: [
                    {
                      OR: [
                        { stream: "ALL" as Stream },
                        { stream: "COMMON_TRUNK" as Stream },
                        { streams: { has: "ALL" as Stream } },
                        { streams: { has: "COMMON_TRUNK" as Stream } },
                      ],
                    },
                    {
                      OR: [{ level: { in: cycleLevels } }, { levels: { hasSome: cycleLevels } }],
                    },
                  ],
                },
              ]
            : []),
        ],
      },
    ],
  };
}
