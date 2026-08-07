# -*- coding: utf-8 -*-
"""
ICS template catalogue for NLP data generation.

Templates 1-9  -> SEEN   (used for training the bi-encoder + extractor)
Templates 10-12 -> UNSEEN (held out entirely; used ONLY for the zero-shot test)

Nothing in this file may be imported into training with split == "unseen".
The guard in build_dataset.py enforces that.

Field data types:
    TEXT   free text span
    ENUM   one of `options` (canonical codes); extraction -> normaliser -> code
    NUM    integer
    DATE   ISO date after normalisation
    BOOL   true/false
"""

from __future__ import annotations

# --------------------------------------------------------------------------
# Shared value pools
# --------------------------------------------------------------------------

DESTINATIONS_EMBASSY = [
    "السفارة الألمانية",
    "السفارة الفرنسية",
    "السفارة الإيطالية",
    "السفارة الروسية",
    "القنصلية الهندية",
    "السفارة الكندية",
]

DESTINATIONS_LOCAL = [
    "المصرف التجاري السوري",
    "بنك بيمو السعودي الفرنسي",
    "وزارة التعليم العالي",
    "مديرية الهجرة والجوازات",
    "الشركة السورية للاتصالات",
    "نقابة المهندسين",
    "مؤسسة الإسكان العسكرية",
]

PURPOSES = [
    "التقدم لمنحة دراسية",
    "استكمال أوراق الفيزا",
    "التقدم لوظيفة",
    "معاملة بنكية",
    "تأجيل الخدمة الإلزامية",
    "التسجيل في دورة تدريبية",
    "إجراءات السفر",
    "تقديم على ماستر في الخارج",
]

LANGUAGES = [("AR", "العربية"), ("EN", "الإنكليزية"), ("FR", "الفرنسية")]

SEMESTERS = [("S1", "الفصل الأول"), ("S2", "الفصل الثاني"), ("SUMMER", "الفصل الصيفي")]

ACADEMIC_YEARS = ["2023-2024", "2024-2025", "2025-2026"]

MAJORS = [
    "هندسة المعلوماتية",
    "هندسة الاتصالات",
    "هندسة الميكاترونيك",
    "الهندسة الكهربائية",
    "هندسة الطيران",
    "علوم أساسية",
]

COURSES = [
    ("قواعد المعطيات", "CS304"),
    ("الذكاء الصنعي", "CS412"),
    ("معالجة الإشارات", "EE321"),
    ("التحليل الرياضي", "MA102"),
    ("نظم التشغيل", "CS310"),
    ("الفيزياء التطبيقية", "PH201"),
]

EXAM_TYPES = [("MIDTERM", "الامتحان الفصلي"), ("FINAL", "الامتحان النهائي"), ("PRACTICAL", "الامتحان العملي")]

LEAVE_TYPES = [("ANNUAL", "إجازة سنوية"), ("SICK", "إجازة مرضية"), ("UNPAID", "إجازة بلا أجر"), ("EMERGENCY", "إجازة اضطرارية")]

CONFERENCES = [
    "المؤتمر الدولي للذكاء الصنعي",
    "مؤتمر تقانات الاتصالات",
    "ورشة عمل الأمن السيبراني",
    "المؤتمر العربي للهندسة الطبية",
]

COUNTRIES = ["ألمانيا", "الإمارات", "تونس", "الأردن", "إيطاليا", "مصر"]

RECRUITMENT_DIVISIONS = [
    "شعبة تجنيد دمشق",
    "شعبة تجنيد ريف دمشق",
    "شعبة تجنيد حمص",
    "شعبة تجنيد اللاذقية",
    "شعبة تجنيد حلب",
]

LOSS_CIRCUMSTANCES = [
    "فقدتها في الباص",
    "ضاعت مني داخل الحرم الجامعي",
    "سُرقت محفظتي وفيها البطاقة",
    "فقدتها أثناء السفر",
]

WITHDRAWAL_REASONS = [
    "ظروف صحية",
    "ظروف عائلية طارئة",
    "السفر خارج القطر",
    "أداء الخدمة الإلزامية",
    "ظروف مادية",
]

MAJOR_CHANGE_REASONS = [
    "ميولي العلمية تتوافق أكثر مع الاختصاص الجديد",
    "صعوبة المواد في الاختصاص الحالي",
    "فرص العمل أفضل في الاختصاص الجديد",
    "نصيحة من المشرف الأكاديمي",
]


def _enum(options):
    """options: list of (code, arabic_label) -> field option structure."""
    return [{"code": c, "label_ar": l} for c, l in options]


# --------------------------------------------------------------------------
# Templates
# --------------------------------------------------------------------------

TEMPLATES = [
    {
        "code": "ENROLL_CERT",
        "split": "seen",
        "name_ar": "إفادة قيد جامعي",
        "name_en": "Enrollment certificate",
        "requester_type": "STUDENT",
        "description_ar": "إفادة رسمية تثبت أن مقدم الطلب طالب مسجل حالياً في المعهد، تُقدَّم إلى جهة خارجية.",
        "canonical_examples": [
            "أرجو منحي إفادة قيد جامعي تثبت أنني طالب مسجل هذا العام لتقديمها إلى السفارة الألمانية.",
            "بحاجة لورقة تثبت إني طالب هون لأقدمها للبنك، نسختين بالإنكليزي.",
            "الرجاء إصدار إفادة تسجيل باللغة الإنكليزية لغرض التقدم لمنحة دراسية.",
        ],
        "fields": [
            {"key": "purpose", "data_type": "TEXT", "label_ar": "الغرض",
             "question_ar": "لأي غرض تحتاج الإفادة؟", "pool": PURPOSES, "present_rate": 0.8},
            {"key": "destination_entity", "data_type": "TEXT", "label_ar": "الجهة المقدَّم إليها",
             "question_ar": "ما الجهة التي ستُقدَّم إليها الإفادة؟",
             "pool": DESTINATIONS_EMBASSY + DESTINATIONS_LOCAL, "present_rate": 0.75},
            {"key": "language", "data_type": "ENUM", "label_ar": "لغة الإفادة",
             "question_ar": "بأي لغة تريد الإفادة؟", "options": _enum(LANGUAGES), "present_rate": 0.6},
            {"key": "copies", "data_type": "NUM", "label_ar": "عدد النسخ",
             "question_ar": "كم نسخة تريد؟", "pool": [1, 2, 3, 4, 5], "present_rate": 0.5},
        ],
    },
    {
        "code": "TRANSCRIPT",
        "split": "seen",
        "name_ar": "كشف علامات",
        "name_en": "Transcript of records",
        "requester_type": "STUDENT",
        "description_ar": "كشف رسمي بعلامات الطالب ومقرراته لفصل أو سنة دراسية محددة.",
        "canonical_examples": [
            "أرجو إصدار كشف علامات للعام الدراسي 2024-2025 باللغة الإنكليزية.",
            "بدي كشف درجات للفصل الأول، نسخة وحدة بتكفي.",
            "الرجاء تزويدي ببيان درجات مصدق لتقديمه إلى وزارة التعليم العالي.",
        ],
        "fields": [
            {"key": "academic_year", "data_type": "TEXT", "label_ar": "العام الدراسي",
             "question_ar": "ما العام الدراسي المطلوب؟", "pool": ACADEMIC_YEARS, "present_rate": 0.7},
            {"key": "semester", "data_type": "ENUM", "label_ar": "الفصل",
             "question_ar": "أي فصل دراسي؟", "options": _enum(SEMESTERS), "present_rate": 0.6},
            {"key": "language", "data_type": "ENUM", "label_ar": "اللغة",
             "question_ar": "بأي لغة تريد الكشف؟", "options": _enum(LANGUAGES), "present_rate": 0.55},
            {"key": "copies", "data_type": "NUM", "label_ar": "عدد النسخ",
             "question_ar": "كم نسخة تريد؟", "pool": [1, 2, 3], "present_rate": 0.45},
        ],
    },
    {
        "code": "NO_OBJECTION",
        "split": "seen",
        "name_ar": "شهادة عدم اعتراض",
        "name_en": "No-objection certificate",
        "requester_type": "EMPLOYEE",
        "description_ar": "كتاب رسمي يفيد بعدم ممانعة الجهة من سفر الموظف أو تقدمه لجهة أخرى.",
        "canonical_examples": [
            "أرجو منحي شهادة عدم اعتراض لتقديمها إلى السفارة الفرنسية بغرض إجراءات السفر.",
            "بحاجة كتاب عدم ممانعة للسفر بتاريخ 2026-09-15.",
            "الرجاء إصدار عدم اعتراض على تقدمي لوظيفة في نقابة المهندسين.",
        ],
        "fields": [
            {"key": "destination_entity", "data_type": "TEXT", "label_ar": "الجهة المقصودة",
             "question_ar": "ما الجهة التي سيُقدَّم إليها الكتاب؟",
             "pool": DESTINATIONS_EMBASSY + DESTINATIONS_LOCAL, "present_rate": 0.85},
            {"key": "purpose", "data_type": "TEXT", "label_ar": "الغرض",
             "question_ar": "ما الغرض من الكتاب؟", "pool": PURPOSES, "present_rate": 0.7},
            {"key": "travel_date", "data_type": "DATE", "label_ar": "تاريخ السفر",
             "question_ar": "ما تاريخ السفر؟", "pool": "DATE", "present_rate": 0.5},
        ],
    },
    {
        "code": "MILITARY_DEFER",
        "split": "seen",
        "name_ar": "إفادة لسوق التجنيد (تأجيل)",
        "name_en": "Military service deferment statement",
        "requester_type": "STUDENT",
        "description_ar": "إفادة موجهة إلى شعبة التجنيد لتأجيل الخدمة الإلزامية بسبب الدراسة.",
        "canonical_examples": [
            "أرجو إصدار إفادة موجهة إلى شعبة تجنيد دمشق لتأجيل خدمتي عن عام 2026.",
            "بدي ورقة للتجنيد تثبت إني طالب لتأجيل السوق.",
            "الرجاء منحي إفادة تأجيل خدمة إلزامية لشعبة تجنيد حمص.",
        ],
        "fields": [
            {"key": "recruitment_division", "data_type": "TEXT", "label_ar": "شعبة التجنيد",
             "question_ar": "إلى أي شعبة تجنيد توجَّه الإفادة؟", "pool": RECRUITMENT_DIVISIONS, "present_rate": 0.8},
            {"key": "deferment_year", "data_type": "NUM", "label_ar": "سنة التأجيل",
             "question_ar": "لأي سنة تريد التأجيل؟", "pool": [2025, 2026, 2027], "present_rate": 0.6},
        ],
    },
    {
        "code": "STUDY_WITHDRAWAL",
        "split": "seen",
        "name_ar": "طلب انقطاع مؤقت عن الدراسة",
        "name_en": "Temporary study withdrawal",
        "requester_type": "STUDENT",
        "description_ar": "طلب تجميد التسجيل والانقطاع عن الدراسة لفصل أو أكثر مع الاحتفاظ بالمقعد.",
        "canonical_examples": [
            "أرجو الموافقة على انقطاعي عن الدراسة لمدة فصلين بسبب ظروف صحية.",
            "بدي جمّد تسجيلي من الفصل الثاني بسبب السفر خارج القطر.",
            "الرجاء منحي إجازة دراسية اعتباراً من الفصل الأول لظروف عائلية طارئة.",
        ],
        "fields": [
            {"key": "reason", "data_type": "TEXT", "label_ar": "السبب",
             "question_ar": "ما سبب الانقطاع؟", "pool": WITHDRAWAL_REASONS + ["الانتقال إلى جامعة أخرى"], "present_rate": 0.85},
            {"key": "from_semester", "data_type": "ENUM", "label_ar": "اعتباراً من فصل",
             "question_ar": "من أي فصل يبدأ الانقطاع؟", "options": _enum(SEMESTERS), "present_rate": 0.6},
            {"key": "duration_semesters", "data_type": "NUM", "label_ar": "عدد الفصول",
             "question_ar": "كم فصلاً مدة الانقطاع؟", "pool": [1, 2, 3, 4], "present_rate": 0.65},
        ],
    },
    {
        "code": "CHANGE_MAJOR",
        "split": "seen",
        "name_ar": "طلب نقل اختصاص",
        "name_en": "Change of major",
        "requester_type": "STUDENT",
        "description_ar": "طلب الانتقال من اختصاص أكاديمي إلى اختصاص آخر داخل المعهد.",
        "canonical_examples": [
            "أرغب بنقل اختصاصي من هندسة الاتصالات إلى هندسة المعلوماتية لأن ميولي العلمية تتوافق أكثر مع الاختصاص الجديد.",
            "بدي غيّر فرعي لهندسة الميكاترونيك.",
            "الرجاء الموافقة على انتقالي من العلوم الأساسية إلى الهندسة الكهربائية.",
        ],
        "fields": [
            {"key": "current_major", "data_type": "TEXT", "label_ar": "الاختصاص الحالي",
             "question_ar": "ما اختصاصك الحالي؟", "pool": MAJORS, "present_rate": 0.7},
            {"key": "target_major", "data_type": "TEXT", "label_ar": "الاختصاص المطلوب",
             "question_ar": "إلى أي اختصاص تريد الانتقال؟", "pool": MAJORS, "present_rate": 0.9},
            {"key": "reason", "data_type": "TEXT", "label_ar": "السبب",
             "question_ar": "ما سبب طلب النقل؟", "pool": MAJOR_CHANGE_REASONS, "present_rate": 0.6},
        ],
    },
    {
        "code": "GRADE_APPEAL",
        "split": "seen",
        "name_ar": "اعتراض على علامة",
        "name_en": "Grade appeal",
        "requester_type": "STUDENT",
        "description_ar": "طلب إعادة تصحيح أو مراجعة علامة مقرر بعد إعلان النتائج.",
        "canonical_examples": [
            "أرجو إعادة تصحيح ورقتي في مقرر قواعد المعطيات CS304 في الامتحان النهائي، علامتي 48.",
            "بدي اعترض على علامتي بالذكاء الصنعي، بظن في خطأ بالجمع.",
            "الرجاء مراجعة نتيجتي في الامتحان الفصلي لمادة التحليل الرياضي.",
        ],
        "fields": [
            {"key": "course_name", "data_type": "TEXT", "label_ar": "اسم المقرر",
             "question_ar": "ما اسم المقرر؟", "pool": [c[0] for c in COURSES], "present_rate": 0.9},
            {"key": "course_code", "data_type": "TEXT", "label_ar": "رمز المقرر",
             "question_ar": "ما رمز المقرر؟", "pool": [c[1] for c in COURSES], "present_rate": 0.45},
            {"key": "exam_type", "data_type": "ENUM", "label_ar": "نوع الامتحان",
             "question_ar": "أي امتحان تعترض على علامته؟", "options": _enum(EXAM_TYPES), "present_rate": 0.6},
            {"key": "grade_received", "data_type": "NUM", "label_ar": "العلامة الممنوحة",
             "question_ar": "ما العلامة التي حصلت ��ليها؟", "pool": [32, 45, 48, 55, 58, 61], "present_rate": 0.5},
        ],
    },
    {
        "code": "SALARY_CERT",
        "split": "seen",
        "name_ar": "كتاب تعريف بالراتب",
        "name_en": "Salary certificate",
        "requester_type": "EMPLOYEE",
        "description_ar": "كتاب رسمي يبيّن راتب الموظف الشهري، يُقدَّم عادةً إلى مصرف أو جهة تمويل.",
        "canonical_examples": [
            "أرجو إصدار كتاب تعريف بالراتب موجه إلى المصرف التجاري السوري مع بيان التعويضات.",
            "بدي ورقة براتبي للبنك.",
            "الرجاء تزويدي بتعريف راتب لتقديمه إلى بنك بيمو السعودي الفرنسي.",
        ],
        "fields": [
            {"key": "destination_entity", "data_type": "TEXT", "label_ar": "الجهة المقصودة",
             "question_ar": "إلى أي جهة سيُقدَّم الكتاب؟", "pool": DESTINATIONS_LOCAL, "present_rate": 0.85},
            {"key": "include_allowances", "data_type": "BOOL", "label_ar": "تضمين التعويضات",
             "question_ar": "هل تريد تضمين التعويضات؟", "pool": [True, False], "present_rate": 0.5},
        ],
    },
    {
        "code": "ID_REPLACEMENT",
        "split": "seen",
        "name_ar": "بدل ضائع للبطاقة الجامعية",
        "name_en": "Replacement student ID card",
        "requester_type": "STUDENT",
        "description_ar": "طلب إصدار بطاقة جامعية بديلة عن بطاقة مفقودة أو تالفة.",
        "canonical_examples": [
            "أرجو إصدار بطاقة جامعية بدل ضائع، فقدتها بتاريخ 2026-07-20 في الباص.",
            "ضاعت مني الهوية الجامعية، بدي بدل ضائع.",
            "الرجاء منحي بطاقة بديلة، سُرقت محفظتي وفيها البطاقة.",
        ],
        "fields": [
            {"key": "loss_date", "data_type": "DATE", "label_ar": "تاريخ الفقدان",
             "question_ar": "متى فقدت البطاقة؟", "pool": "DATE", "present_rate": 0.6},
            {"key": "loss_circumstances", "data_type": "TEXT", "label_ar": "ظروف الفقدان",
             "question_ar": "كيف فقدت البطاقة؟", "pool": LOSS_CIRCUMSTANCES, "present_rate": 0.75},
        ],
    },
    # ---------------- UNSEEN: zero-shot evaluation only ----------------
    {
        "code": "PROVISIONAL_GRAD",
        "split": "unseen",
        "name_ar": "إفادة تخرج مؤقتة",
        "name_en": "Provisional graduation certificate",
        "requester_type": "STUDENT",
        "description_ar": "إفادة مؤقتة تُمنح لمن أنهى دراسته وأتمّ متطلبات التخرج، "
                           "ريثما تصدر وثيقة التخرج النهائية. "
                           "وهي ليست إفادة قيد، إذ إن صاحبها لم يعد طالباً مسجّلاً.",
        "canonical_examples": [
            "أرجو منحي إفادة تخرج مؤقتة تثبت أنني أنهيت دراستي وتخرجت عام 2025، ريثما تصدر وثيقة التخرج النهائية.",
            "بدي ورقة تثبت إني تخرجت وخلصت دراستي، لحتى تطلع الوثيقة الأصلية.",
            "الرجاء إصدار إفادة تخرج مؤقتة باللغة الإنكليزية بعد إتمامي متطلبات التخرج، لتقديمها إلى وزارة التعليم العالي.",
        ],
        "fields": [
            {"key": "graduation_year", "data_type": "NUM", "label_ar": "سنة التخرج",
             "question_ar": "ما سنة تخرجك؟", "pool": [2024, 2025, 2026], "present_rate": 0.7},
            {"key": "language", "data_type": "ENUM", "label_ar": "اللغة",
             "question_ar": "بأي لغة تريد الإفادة؟", "options": _enum(LANGUAGES), "present_rate": 0.55},
            {"key": "destination_entity", "data_type": "TEXT", "label_ar": "الجهة المقصودة",
             "question_ar": "ما الجهة التي ستُقدَّم إليها؟",
             "pool": DESTINATIONS_EMBASSY + DESTINATIONS_LOCAL, "present_rate": 0.7},
        ],
    },
    {
        "code": "CONFERENCE",
        "split": "unseen",
        "name_ar": "طلب مشاركة في مؤتمر علمي",
        "name_en": "Conference participation request",
        "requester_type": "EMPLOYEE",
        "description_ar": "طلب موافقة على المشاركة في مؤتمر أو مهمة علمية داخل القطر أو خارجه.",
        "canonical_examples": [
            "أرجو الموافقة على مشاركتي في المؤتمر الدولي للذكاء الصنعي في ألمانيا بتاريخ 2026-10-05 مع طلب تمويل.",
            "بدي شارك بمؤتمر تقانات الاتصالات بتونس.",
            "الرجاء الموافقة على مهمة علمية لحضور ورشة عمل الأمن السيبراني في الأردن.",
        ],
        "fields": [
            {"key": "conference_name", "data_type": "TEXT", "label_ar": "اسم المؤتمر",
             "question_ar": "ما اسم المؤتمر؟", "pool": CONFERENCES, "present_rate": 0.9},
            {"key": "country", "data_type": "TEXT", "label_ar": "البلد",
             "question_ar": "في أي بلد يُعقد المؤتمر؟", "pool": COUNTRIES, "present_rate": 0.8},
            {"key": "start_date", "data_type": "DATE", "label_ar": "تاريخ البدء",
             "question_ar": "ما تاريخ بدء المؤتمر؟", "pool": "DATE", "present_rate": 0.6},
            {"key": "funding_requested", "data_type": "BOOL", "label_ar": "طلب تمويل",
             "question_ar": "هل تطلب تمويلاً؟", "pool": [True, False], "present_rate": 0.5},
        ],
    },
    {
        "code": "ADMIN_LEAVE",
        "split": "unseen",
        "name_ar": "طلب إجازة إدارية",
        "name_en": "Administrative leave request",
        "requester_type": "EMPLOYEE",
        "description_ar": "طلب إجازة للموظف بأنواعها: سنوية، مرضية، بلا أجر، أو اضطرارية.",
        "canonical_examples": [
            "أرجو منحي إجازة سنوية لمدة 5 أيام اعتباراً من 2026-08-10.",
            "بدي إجازة مرضية يومين، معي تقرير طبي.",
            "الرجاء الموافقة على إجازة بلا أجر لظروف عائلية طارئة.",
        ],
        "fields": [
            {"key": "leave_type", "data_type": "ENUM", "label_ar": "نوع الإجازة",
             "question_ar": "ما نوع الإجازة؟", "options": _enum(LEAVE_TYPES), "present_rate": 0.85},
            {"key": "start_date", "data_type": "DATE", "label_ar": "تاريخ البدء",
             "question_ar": "متى تبدأ الإجازة؟", "pool": "DATE", "present_rate": 0.7},
            {"key": "days_count", "data_type": "NUM", "label_ar": "عدد الأيام",
             "question_ar": "كم يوماً؟", "pool": [1, 2, 3, 5, 7, 10, 14], "present_rate": 0.75},
            {"key": "reason", "data_type": "TEXT", "label_ar": "السبب",
             "question_ar": "ما سبب الإجازة؟", "pool": WITHDRAWAL_REASONS, "present_rate": 0.55},
        ],
    },
]

BY_CODE = {t["code"]: t for t in TEMPLATES}
SEEN = [t for t in TEMPLATES if t["split"] == "seen"]
UNSEEN = [t for t in TEMPLATES if t["split"] == "unseen"]


def template_document(t: dict) -> str:
    """The text embedded by the bi-encoder to represent a template.

    Built ONLY from data the backend already stores, so a newly created
    template gets a vector with no retraining and no code change.
    """
    fields = "، ".join(f["label_ar"] for f in t["fields"])
    examples = " ".join(t["canonical_examples"])
    return (
        f"{t['name_ar']} ({t['name_en']}). "
        f"{t['description_ar']} "
        f"الحقول: {fields}. "
        f"أمثلة: {examples}"
    )


def out_of_scope_prompts_seed() -> list:
    """Seeds for the out-of-scope / abstain test set (test-4)."""
    return [
        "نص عن مشكلة تقنية في الموقع لا علاقة له بأي طلب إداري",
        "شكوى عن نظافة المدرجات",
        "سؤال عن موعد بدء التسجيل فقط دون طلب وثيقة",
        "طلب يجمع نوعين مختلفين من الطلبات في نص واحد",
        "رسالة شكر للإدارة",
        "طلب خدمة غير موجودة إطلاقاً مثل حجز ملعب رياضي",
    ]