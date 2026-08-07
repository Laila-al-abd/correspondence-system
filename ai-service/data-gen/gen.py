# -*- coding: utf-8 -*-
"""Role-separated Arabic request generator. Usage: gen.py <PREFIX> <SRCDIR> <OUTDIR>

The nine SEEN templates produce output byte-identical to the shipped A/B/C sets.
PROVISIONAL_GRAD / CONFERENCE / ADMIN_LEAVE are the held-out (unseen) templates.
"""
import re, json, sys, hashlib
from pathlib import Path

PFX = sys.argv[1]
SRC = Path(sys.argv[2])
OUT = Path(sys.argv[3]); OUT.mkdir(parents=True, exist_ok=True)

AR = str.maketrans('0123456789', '٠١٢٣٤٥٦٧٨٩')

TRAVEL = {'إجراءات السفر', 'استكمال أوراق الفيزا',
          'تقديم على ماستر في الخارج', 'التقدم لمنحة دراسية'}

PURPOSE_CARRIERS_MSA = ['وذلك لغرض ', 'من أجل ', 'بهدف ', 'بغرض ',
                        'وذلك لأجل ', 'لاستخدامها في ', 'بخصوص ']
PURPOSE_CARRIERS_DIA = ['لأني بحاجتها من أجل ', 'من أجل ', 'لأني عم قدم من أجل ',
                        'بهدف ', 'لأنو لازمني من أجل ', 'لغرض ']
DEST_FEM = ['على أن تُقدَّم إلى ', 'ومقدَّمة إلى ', 'موجَّهة إلى ',
            'لتقديمها إلى ', 'وهي مطلوبة من قبل ']
DEST_MASC = ['على أن يُقدَّم إلى ', 'ومقدَّم إلى ', 'موجَّه إلى ',
             'لتقديمه إلى ', 'وهو مطلوب من قبل ']

ALT_OBJ = {
    'ENROLL_CERT': 'ورقة تثبت إني مسجّل بالجامعة هالسنة',
    'NO_OBJECTION': 'ورقة تقول إنو ما في مانع عندكم',
    'SALARY_CERT': 'ورقة فيها قديش راتبي بالشهر',
    'TRANSCRIPT': 'ورقة فيها كل علاماتي',
    'MILITARY_DEFER': 'ورقة تؤجّل لي السوقة بسبب الدراسة',
    'GRADE_APPEAL': 'إعادة النظر بورقتي وتصحيحها من جديد',
    'CHANGE_MAJOR': 'أغيّر فرعي الجامعي',
    'STUDY_WITHDRAWAL': 'أوقّف دراستي مؤقتاً وأضل محتفظاً بمقعدي',
    'ID_REPLACEMENT': 'بطاقة بدل عن اللي ضاعت مني',
    'PROVISIONAL_GRAD': 'ورقة تثبت إني تخرّجت لحتى تطلع الوثيقة الأصلية',
    'CONFERENCE': 'حضور فعالية علمية والمشاركة فيها',
    'ADMIN_LEAVE': 'فترة راحة من الدوام',
}
EN_EXTRA = {
    'TRANSCRIPT': ' وياريت يكون الـ transcript جاهزاً قبل نهاية الشهر.',
    'NO_OBJECTION': ' وهي المعروفة باسم no-objection letter.',
    'ENROLL_CERT': ' وهي المعروفة باسم enrollment certificate.',
    'SALARY_CERT': ' وهي المطلوبة باسم salary certificate.',
    'PROVISIONAL_GRAD': ' وهي المعروفة باسم provisional graduation certificate.',
    'CONFERENCE': ' وقد وصلتني الـ invitation letter من الجهة المنظمة.',
    'ADMIN_LEAVE': ' وياريت تصدر الموافقة قبل الـ deadline.',
}
EN_DEFAULT = ' وياريت تكون ready بأسرع وقت.'

COUNTRIES = ['ألمانيا', 'الإمارات', 'تونس', 'الأردن', 'إيطاليا', 'مصر']
LEAVE_TYPES = ['إجازة سنوية', 'إجازة مرضية', 'إجازة بلا أجر', 'إجازة اضطرارية']

VAL_TYPO = {
    'العربية': 'الهربية', 'الإنكليزية': 'الانكليزية',
    'الفرنسية': 'الفرنسيه', 'هندسة الميكاترونيك': 'هندسة الميكترونيك',
    'الهندسة الكهربائية': 'الهندسة الكهريائية', 'هندسة المعلوماتية': 'هندسة المعلوماتيه',
    'الذكاء الصنعي': 'الذكاء الصناعي', 'معالجة الإشارات': 'معالجة الاشارات',
    'الفيزياء التطبيقية': 'الفيزيا التطبيقية',
    'ثلاثة فصول': 'ثلاث قصول', 'أربعة فصول': 'اربعة قصول',
    'المؤتمر الدولي للذكاء الصنعي': 'المؤتمر الدولي للذكاء الصناعي',
    'ورشة عمل الأمن السيبراني': 'ورشة عمل الامن السيبراني',
}
CONN_TYPO = [('إلى', 'الى'), ('أرجو', 'ارجو'), ('ذلك', 'زلك'),
             ('وذلك', 'وزلك'), ('شاكراً', 'شاكرا'), ('إنجاز', 'انجاز')]

COPIES = {'1': 'نسخة واحدة', '2': 'نسختين', '3': 'ثلاث نسخ',
          '4': 'أربع نسخ', '5': 'خمس نسخ'}
SEMS = {'1': 'فصل واحد', '2': 'فصلين', '3': 'ثلاثة فصول', '4': 'أربعة فصول'}
DAYS = {'1': 'يوم واحد', '2': 'يومين', '3': 'ثلاثة أيام', '5': 'خمسة أيام',
        '7': 'سبعة أيام', '10': 'عشرة أيام', '14': 'أربعة عشر يوماً'}


def pick(pool, sid, salt):
    h = hashlib.md5((sid + salt).encode('utf8')).hexdigest()
    return pool[int(h[:8], 16) % len(pool)]


def other_than(pool, current, sid, salt):
    opts = [x for x in pool if x != current]
    return pick(opts, sid, salt) if opts else None


def lam(w):
    return 'لل' + w[2:] if w.startswith('ال') else 'لـ' + w


def clean(x):
    return x.strip().replace('\r', '')


def parse(p):
    z = p.read_text(encoding='utf8'); out = []
    for b in re.split(r'--- spec_id: ', z)[1:]:
        sid = clean(b.split(' ---')[0]); vals = {}
        for m in re.finditer(r'  - (\w+) \([^)]+\): (.+)', b):
            vals[m.group(1)] = clean(m.group(2))
        st = clean((re.findall(r'الأسلوب: (.+)', b) or [''])[0])
        sw = clean((re.findall(r'ابدأ بـ[^«]*«([^»]+)»', b) or [''])[0])
        ex = clean((re.findall(r'إضافة: (.+)', b) or [''])[0])
        out.append((sid, vals, st, sw, ex))
    return out


def num(s, st):
    s = str(s)
    if re.fullmatch(r'\d{4}-\d{2}-\d{2}', s):
        y, m, d = s.split('-')
        s = '%s-%s-%s' % (y, int(m), int(d))
    return s.translate(AR) if 'هندية' in st else s


def words(mapping, n, st):
    return mapping.get(str(n), str(n)) if 'بالحروف' in st else num(n, st)


def opener(sw, obj, dia, grant=True):
    """grant=True for a document you are GIVEN, False for an action APPROVED."""
    approve = 'الموافقة على منحي ' if grant else 'الموافقة على '
    give = 'منحي ' if grant else 'الموافقة على '
    if not sw:
        return ('بدي ' if dia else 'أتقدم بطلب ') + obj
    if sw == 'بدي':
        return 'بدي ' + obj
    if sw == 'الرجاء':
        return 'الرجاء ' + give + obj
    if sw == 'أتقدم إليكم':
        return 'أتقدم إليكم بطلب ' + obj
    if sw == 'أرجو من سيادتكم':
        return 'أرجو من سيادتكم ' + approve + obj
    if sw == 'لو سمحتو':
        return 'لو سمحتو ' + ('بدي ' if dia else ('أرجو منحي ' if grant else 'أرجو الموافقة على ')) + obj
    return sw + '، ' + ('بدي ' if dia else 'أتقدم بطلب ') + obj


def build(sid, v, st, sw, ex):
    code = re.match(PFX + r'-([A-Z_]+)-', sid).group(1)
    dia = 'شامية' in st
    heavy = 'عدة أخطاء' in st
    light = 'خطأ إملائي أو خطأين' in st
    short = 'جملة واحدة' in st
    para = 'فقرة كاملة' in st
    noname = 'لا تستخدم اسم الطلب الرسمي' in ex
    sf = {}
    grant = True

    def val(key, text=None, no_typo=False):
        raw = text if text is not None else v.get(key)
        if raw is None:
            return None
        s = raw if (no_typo or not heavy) else VAL_TYPO.get(raw, raw)
        sf[key] = s
        return s

    pc = pick(PURPOSE_CARRIERS_DIA if dia else PURPOSE_CARRIERS_MSA, sid, 'p')
    fem = True

    if code == 'ENROLL_CERT':
        obj = ALT_OBJ[code] if noname else (
            'إفادة قيد تثبت إني مسجل' if dia else 'إفادة قيد جامعي تثبت تسجيلي الحالي')
        if v.get('purpose'):
            obj += '، ' + pc + val('purpose')
        if v.get('destination_entity'):
            obj += '، ' + pick(DEST_FEM, sid, 'd') + val('destination_entity')
        if v.get('language'):
            obj += '، محررة باللغة ' + val('language')
        if v.get('copies'):
            c = val('copies', words(COPIES, v['copies'], st))
            obj += '، بواقع ' + c + ('' if 'بالحروف' in st else ' نسخ')

    elif code == 'NO_OBJECTION':
        obj = ALT_OBJ[code] if noname else 'شهادة عدم ممانعة'
        p = v.get('purpose')
        if p:
            obj += '، ' + pc + val('purpose')
        if v.get('destination_entity'):
            obj += '، ' + pick(DEST_FEM, sid, 'd') + val('destination_entity')
        if v.get('travel_date'):
            d = val('travel_date', num(v['travel_date'], st))
            obj += ('، علماً أن تاريخ السفر المحدد هو ' if p in TRAVEL
                    else '، وذلك اعتباراً من تاريخ ') + d

    elif code == 'SALARY_CERT':
        if noname:
            obj = ALT_OBJ[code]; fem = True
        elif dia:
            obj = 'ورقة تثبت راتبي الشهري'; fem = True
        else:
            obj = 'كتاب تعريف يبيّن راتبي الشهري'; fem = False
        a = v.get('include_allowances')
        if a == 'نعم':
            obj += ' ' + val('include_allowances', 'شاملاً التعويضات')
        elif a == 'لا':
            obj += ' ' + val('include_allowances', 'دون احتساب التعويضات')
        if v.get('destination_entity'):
            obj += '، ' + pick(DEST_FEM if fem else DEST_MASC, sid, 'd') + val('destination_entity')

    elif code == 'MILITARY_DEFER':
        obj = ALT_OBJ[code] if noname else 'إفادة لتأجيل الخدمة الإلزامية بسبب الدراسة'
        if v.get('recruitment_division'):
            obj += '، ' + pick(DEST_FEM, sid, 'd') + val('recruitment_division')
        if v.get('deferment_year'):
            obj += '، وذلك لعام ' + val('deferment_year', num(v['deferment_year'], st))

    elif code == 'GRADE_APPEAL':
        obj = ALT_OBJ[code] if noname else 'إعادة تصحيح علامتي'
        if v.get('course_name'):
            obj += ' في مقرر ' + val('course_name')
        if v.get('course_code'):
            obj += ' (' + val('course_code') + ')'
        if v.get('exam_type'):
            obj += ' في ' + val('exam_type')
        if v.get('grade_received'):
            obj += '، إذ بلغت علامتي ' + val('grade_received', num(v['grade_received'], st))

    elif code == 'TRANSCRIPT':
        obj = ALT_OBJ[code] if noname else 'كشف علامات'
        if v.get('semester'):
            obj += ' عن ' + val('semester')
        if v.get('academic_year'):
            obj += ' للعام الدراسي ' + val('academic_year', num(v['academic_year'], st))
        if v.get('language'):
            obj += '، محرراً باللغة ' + val('language')
        if v.get('copies'):
            c = val('copies', words(COPIES, v['copies'], st))
            obj += '، بواقع ' + c + ('' if 'بالحروف' in st else ' نسخ')

    elif code == 'CHANGE_MAJOR':
        obj = ALT_OBJ[code] if noname else 'نقل اختصاصي'
        if v.get('current_major'):
            obj += ' من ' + val('current_major')
        if v.get('target_major'):
            obj += ' إلى ' + val('target_major')
        if v.get('reason'):
            obj += '، وذلك بسبب ' + val('reason')

    elif code == 'STUDY_WITHDRAWAL':
        obj = ALT_OBJ[code] if noname else 'انقطاع مؤقت عن الدراسة مع الاحتفاظ بمقعدي'
        if v.get('reason'):
            obj += '، بسبب ' + val('reason')
        if v.get('from_semester'):
            obj += '، اعتباراً من ' + val('from_semester')
        if v.get('duration_semesters'):
            obj += '، ولمدة ' + val('duration_semesters', words(SEMS, v['duration_semesters'], st))

    elif code == 'ID_REPLACEMENT':
        obj = ALT_OBJ[code] if noname else 'بطاقة جامعية بديلة عن البطاقة المفقودة'
        if v.get('loss_date'):
            obj += '، إذ فقدتها بتاريخ ' + val('loss_date', num(v['loss_date'], st))
        if v.get('loss_circumstances'):
            obj += '، حيث ' + val('loss_circumstances')

    # ---------------------------------------------- held-out (unseen) templates
    elif code == 'PROVISIONAL_GRAD':
        obj = ALT_OBJ[code] if noname else 'إفادة تخرج مؤقتة ريثما تصدر الوثيقة النهائية'
        if v.get('graduation_year'):
            obj += '، عن عام ' + val('graduation_year', num(v['graduation_year'], st))
        if v.get('language'):
            obj += '، محررة باللغة ' + val('language', no_typo=True)
        if v.get('destination_entity'):
            obj += '، ' + pick(DEST_FEM, sid, 'd') + val('destination_entity')

    elif code == 'CONFERENCE':
        grant = False
        verbal = dia and sw in ('بدي', 'لو سمحتو', '')
        head = 'أشارك في ' if verbal else 'المشاركة في '
        if noname:
            # "do not use the official form name" -- describing it in your own
            # words is fine, DELETING a field the spec marks present is not.
            obj = 'أحضر فعالية علمية وأشارك فيها' if verbal else ALT_OBJ[code]
            fem_head = True
            if v.get('conference_name'):
                nm = val('conference_name')
                obj += '، وهي ' + nm
                fem_head = nm.startswith('ورشة')
        elif v.get('conference_name'):
            nm = val('conference_name')
            obj = head + nm
            fem_head = nm.startswith('ورشة')
        else:
            obj = head + 'مؤتمر علمي'
            fem_head = False
        if v.get('country'):
            obj += ('، التي تُعقد في ' if fem_head else '، الذي يُعقد في ') + val('country')
        if v.get('start_date'):
            obj += '، اعتباراً من ' + val('start_date', num(v['start_date'], st))
        f = v.get('funding_requested')
        if f == 'نعم':
            obj += '، ' + val('funding_requested', 'مع طلب تمويل نفقات المشاركة')
        elif f == 'لا':
            obj += '، ' + val('funding_requested', 'دون طلب أي تمويل')

    elif code == 'ADMIN_LEAVE':
        if noname:
            obj = ALT_OBJ[code]
            if v.get('leave_type'):
                obj += '، وهي ' + val('leave_type', no_typo=True)
        elif v.get('leave_type'):
            obj = val('leave_type', no_typo=True)
        else:
            obj = 'إجازة إدارية'
        if v.get('days_count'):
            n = str(v['days_count'])
            if 'بالحروف' in st or n in ('1', '2'):
                # المثنّى: nobody writes "2 أيام"
                obj += '، لمدة ' + val('days_count', DAYS[n])
            else:
                obj += '، لمدة ' + val('days_count', num(n, st)) + ' أيام'
        if v.get('start_date'):
            obj += '، اعتباراً من ' + val('start_date', num(v['start_date'], st))
        if v.get('reason'):
            obj += '، وذلك بسبب ' + val('reason')
    else:
        raise ValueError(code)

    text = opener(sw, obj, dia, grant)

    if 'استعجال' in ex:
        text += '، وأرجو إنجازه بأسرع وقت ممكن لضيق المهلة'
    text += '.'
    if 'اعتذار' in ex or 'ظرف شخصي' in ex:
        text += ' وأعتذر عن الإزعاج، لكن ظروفي الراهنة تضطرني لذلك.'
    if 'إنكليزية' in ex:
        text += EN_EXTRA.get(code, EN_DEFAULT)
    if 'انفِ' in ex or 'ثم انف' in ex:
        # negate a DIFFERENT value of a field this template actually has,
        # otherwise a leave request ends up denying an embassy.
        if sf.get('destination_entity'):
            o = other_than(['السفارة الفرنسية', 'السفارة الكندية', 'وزارة التعليم العالي'],
                          sf['destination_entity'], sid, 'n')
            text += ' وليست ' + lam(o) + '، كما قد يُفهَم.'
        elif sf.get('country'):
            o = other_than(COUNTRIES, sf['country'], sid, 'n')
            text += ' وليس في ' + o + '، كما قد يُفهَم.'
        elif sf.get('leave_type'):
            o = other_than(LEAVE_TYPES, sf['leave_type'], sid, 'n')
            text += ' وهي ليست ' + o + '، كما قد يُفهَم.'

    if para:
        text += ' وأنا على استعداد لتقديم أي وثيقة إضافية تطلبونها، ولكم جزيل الشكر على حسن تعاونكم.'
    elif not short:
        text += ' ولكم جزيل الشكر.'

    if heavy or light:
        k = 3 if heavy else 1
        done = 0
        pre = sw if (sw and text.startswith(sw)) else ''
        body = text[len(pre):]
        for a, b in CONN_TYPO:
            if done >= k:
                break
            if a in body and a not in ''.join(sf.values()):
                body = body.replace(a, b, 1); done += 1
        text = pre + body

    return text, sf


n = 0
files = sorted(SRC.glob(PFX + '_*.txt'))
for p in files:
    items = []
    for sid, v, st, sw, ex in parse(p):
        t, sf = build(sid, v, st, sw, ex)
        items.append({'spec_id': sid, 'text': t, 'used_surface_forms': sf})
        n += 1
    (OUT / (p.stem + '.json')).write_text(
        json.dumps({'items': items}, ensure_ascii=False, indent=2), encoding='utf8')
print('generated %d items across %d files' % (n, len(files)))
