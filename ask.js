/* "Ask about Ben": a guided Q&A assistant.
   Every answer is written from Ben's resume and the projects on this site,
   so it never makes anything up. Free-text questions are matched to the
   closest answer by keyword; anything it can't answer points to email. */
(function () {
  'use strict';

  var panel = document.getElementById('ask-panel');
  if (!panel) return;
  var log = panel.querySelector('.ask-log');
  var chipsBox = panel.querySelector('.ask-chips');
  var form = panel.querySelector('.ask-form');
  var input = panel.querySelector('.ask-input');
  var launch = document.querySelector('.ask-launch');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function see(links) {
    return '<span class="see">' + links.map(function (l) {
      return '<a href="#' + l[0] + '" data-jump="' + l[0] + '">' + l[1] + '</a>';
    }).join('') + '</span>';
  }

  var KB = [
    {
      id: 'consulting', q: 'How would Ben fit in a consulting firm?',
      kw: ['consult', 'firm', 'mckinsey', 'bain', 'bcg', 'deloitte', 'accenture', 'case interview', 'client'],
      a: '<p>He&rsquo;d fit the parts of consulting that matter most early on: structuring a messy problem and explaining it clearly.</p>' +
        '<ul><li><b>Problem framing:</b> on the TSA case, his team reframed the question (screen for objects, not behavior), scored options in a weighted decision matrix, and backed the pick with lane-level financials. Ben presented the &ldquo;why it works&rdquo; and the implementation plan.</li>' +
        '<li><b>Diagnosis:</b> for the Qualico capstone, he owned the problem statement, problem validation, and feasibility analysis.</li>' +
        '<li><b>Live client work:</b> he&rsquo;s on a five-person consulting engagement with Okra Abbey, a New Orleans nonprofit.</li></ul>' +
        '<p>Add weekly presentations to a 161-member chapter and client check-ins at Edoc, and he&rsquo;s comfortable in front of a client from day one.</p>' +
        see([['case-tsa', 'TSA case'], ['case-qualico', 'Qualico case']]),
      next: ['why', 'strategy', 'team']
    },
    {
      id: 'why', q: 'Why should we hire Ben?',
      kw: ['hire', 'why', 'should we', 'stand out', 'standout', 'value', 'convince', 'pitch', 'superstar', 'best candidate'],
      a: '<p>Three reasons, each with proof on this site:</p>' +
        '<ul><li><b>He&rsquo;s done real work already.</b> He&rsquo;s one of six on Edoc&rsquo;s Growth Team, working directly with the CEO and President, and he rebuilt the company&rsquo;s Scriptus whitepaper.</li>' +
        '<li><b>People trust him with money and decisions.</b> As VP of Finance he runs a $65K+ budget and awards $12K+ in scholarships a year.</li>' +
        '<li><b>He can sell.</b> He converted 400+ leads as a brand ambassador, beating national benchmarks at 10&ndash;15% conversion.</li></ul>' +
        '<p>And he designed and built this site himself.</p>' +
        see([['case-scriptus', 'Edoc work'], ['numbers', 'The numbers']]),
      next: ['accomplish', 'roles', 'contact']
    },
    {
      id: 'finance', q: 'Is Ben a fit for a finance role?',
      kw: ['finance', 'financial', 'banking', 'analyst', 'budget', 'accounting', 'fp&a', 'fpa', 'numbers', 'excel', 'model', 'investment'],
      a: '<p>Yes, especially corporate finance, FP&amp;A, or finance-minded strategy roles.</p>' +
        '<ul><li>Runs a $65K+ annual budget as VP of Finance: building projections, tracking spend in real time, and briefing the chapter every week.</li>' +
        '<li>Built the financial case on the TSA project: $1.0&ndash;1.4M per lane, so a $200M budget buys 140&ndash;200 upgraded lanes a year.</li>' +
        '<li>His title at Edoc is Finance &amp; Growth Strategy Intern, and he holds a Microsoft Excel certification and took Financial Management.</li></ul>' +
        see([['leadership', 'VP of Finance'], ['case-tsa', 'TSA financials']]),
      next: ['strategy', 'skills', 'why']
    },
    {
      id: 'marketing', q: 'Is Ben a fit for marketing?',
      kw: ['marketing', 'brand', 'growth', 'gtm', 'go-to-market', 'go to market', 'campaign', 'social', 'customer', 'advertis'],
      a: '<p>Very much. Marketing is one of his two majors, and he&rsquo;s done it for real:</p>' +
        '<ul><li><b>B2B go-to-market</b> at Edoc: rebuilt the Scriptus whitepaper for hospice leaders and built the target-account research behind the campaign.</li>' +
        '<li><b>Consumer strategy:</b> segmented fans and built two flagship campaigns for the Toronto Huskies NFL expansion project.</li>' +
        '<li><b>Selling:</b> 400+ leads converted and 2,500+ customers engaged as a brand ambassador for nine national brands.</li></ul>' +
        '<p>Tools: HubSpot CRM and HubSpot Academy, Canva, and customer journey mapping.</p>' +
        see([['case-scriptus', 'Scriptus'], ['case-huskies', 'Toronto Huskies']]),
      next: ['edoc', 'skills', 'why']
    },
    {
      id: 'strategy', q: 'What about strategy or operations roles?',
      kw: ['strategy', 'strategic', 'operations', 'ops', 'bizops', 'corporate development', 'corp dev', 'management', 'chief of staff'],
      a: '<p>That&rsquo;s the center of his profile. He&rsquo;s a Management major who reaches for structure:</p>' +
        '<ul><li>Industry analysis (PESTEL and Five Forces) on Amerisafe.</li>' +
        '<li>Weighted decision-making and implementation planning on the TSA case.</li>' +
        '<li>Org-design diagnosis and a phased rollout for Qualico.</li>' +
        '<li>Day-to-day strategy work with Edoc&rsquo;s CEO and President.</li></ul>' +
        '<p>His working rule: find the real problem first, then solve it.</p>' +
        see([['projects', 'All projects'], ['how-i-work', 'How he works']]),
      next: ['consulting', 'team', 'edoc']
    },
    {
      id: 'edoc', q: 'What does Ben do at Edoc?',
      kw: ['edoc', 'scriptus', 'intern at', 'current job', 'right now', 'healthcare', 'hospice', 'whitepaper'],
      a: '<p>He&rsquo;s a Finance &amp; Growth Strategy Intern (since May 2026) and one of six on Edoc&rsquo;s Growth Team, working directly with the CEO and President.</p>' +
        '<ul><li>Sharpens positioning for Scriptus, Edoc&rsquo;s AI plus human-verified documentation platform for hospice care.</li>' +
        '<li>Rebuilt the 2026 whitepaper, restructuring most of an earlier draft with new research and a new design.</li>' +
        '<li>Built target-account research on 20+ hospice and home-health organizations, plus client retention outreach.</li>' +
        '<li>Represented Edoc, a 2020 Forbes Small Giants honoree, in the Small Giants community.</li></ul>' +
        see([['case-scriptus', 'See the case study']]),
      next: ['marketing', 'accomplish', 'ai']
    },
    {
      id: 'leadership', q: 'What leadership experience does he have?',
      kw: ['lead', 'leader', 'leadership', 'manage people', 'officer', 'president', 'coach', 'captain', 'akpsi', 'alpha kappa', 'fraternity'],
      a: '<ul><li><b>VP of Finance, Alpha Kappa Psi:</b> one of 8 on the executive committee of a 161-member pre-professional business fraternity; mentors the finance branch.</li>' +
        '<li><b>Warden:</b> elected to the officer board as a sophomore; led the member standards process (70+ interviews).</li>' +
        '<li><b>Head Coach, Tulane Special Olympics:</b> leads practices for about 30 athletes and recruited 20+ volunteers for an ESPN Top 5 chapter.</li></ul>' +
        '<p>Notice the range: running a budget, running a process, and coaching athletes all ask for different kinds of leadership.</p>' +
        see([['leadership', 'Leadership']]),
      next: ['team', 'finance', 'why']
    },
    {
      id: 'team', q: 'What is Ben like to work with?',
      kw: ['like to work', 'work with', 'personality', 'culture', 'team player', 'teamwork', 'character', 'style', 'person', 'soft skill', 'communicat'],
      a: '<p>Based on what he&rsquo;s done, expect someone who:</p>' +
        '<ul><li><b>Runs the numbers, then runs the room.</b> He builds the budget and explains it to the chapter every week.</li>' +
        '<li><b>Asks what the problem actually is</b> before jumping to answers.</li>' +
        '<li><b>Leaves things better than he found them,</b> like a rebuilt whitepaper or a standards process that finished 30 minutes faster.</li></ul>' +
        '<p>His Psychology minor and years coaching Special Olympics athletes show up as patience and people-reading.</p>' +
        see([['how-i-work', 'How I work']]),
      next: ['culture', 'challenge', 'consulting']
    },
    {
      id: 'ai', q: 'How does Ben use AI?',
      kw: ['ai', 'ai tools', 'artificial', 'chatgpt', 'claude', 'llm', 'technology', 'tech', 'automation', 'digital', 'website', 'built this'],
      a: '<p>Comfortably, and with judgment:</p>' +
        '<ul><li>Holds Tulane&rsquo;s AI Literacy Certificate and took an Artificial Intelligence Tools course.</li>' +
        '<li>Designed and built this entire site with Claude as his AI partner, from layout to these interactive features.</li>' +
        '<li>Uses Claude and ChatGPT day to day for research and drafting, and positions an AI product (Scriptus) at Edoc.</li></ul>' +
        '<p>His take: use AI to move faster on research, analysis, and building, and keep the judgment calls human.</p>' +
        see([['case-site', 'How he built this site']]),
      next: ['edoc', 'skills', 'why']
    },
    {
      id: 'accomplish', q: 'What is his biggest accomplishment?',
      kw: ['accomplish', 'achievement', 'proud', 'biggest', 'best work', 'impressive', 'highlight'],
      a: '<p>Our pick: earning a seat on Edoc&rsquo;s six-person Growth Team as an undergrad, then delivering a rebuilt whitepaper and target-account research for an AI healthcare product. That&rsquo;s real company strategy work, not a class exercise.</p>' +
        '<p>Close second: being trusted with a $65K+ budget and $12K+ in scholarships as VP of Finance.</p>' +
        see([['case-scriptus', 'Edoc work'], ['trajectory', 'The $BEN chart']]),
      next: ['why', 'edoc', 'leadership']
    },
    {
      id: 'roles', q: 'What roles is Ben looking for?',
      kw: ['looking for', 'roles', 'role', 'position', 'industr', 'sector', 'opportunit', 'full-time', 'full time', 'available', 'start date', 'when can', 'graduat', 'internship', 'job'],
      a: '<p><b>Full-time roles</b> in <b>strategy, finance, and marketing</b>, starting after he graduates from Tulane&rsquo;s A.B. Freeman School of Business in <b>May 2027</b>. He isn&rsquo;t looking for internships.</p>' +
        '<p>He&rsquo;s open on industry. Consulting, corporate strategy, sports business, healthcare, and startups all interest him; what matters most is the team.</p>' +
        '<p>For timing, location, or a specific opening, the fastest answer is an email: <a href="mailto:beisen@tulane.edu">beisen@tulane.edu</a>.</p>',
      next: ['culture', 'future', 'location']
    },
    {
      id: 'location', q: 'Where is Ben based?',
      kw: ['where', 'location', 'based', 'relocat', 'city', 'remote', 'move', 'live', 'chicago', 'new orleans'],
      a: '<p><b>Chicago is his first choice.</b> It&rsquo;s home, and he&rsquo;d love to start his career there. He&rsquo;s also open to relocating for the right role and team.</p>' +
        '<p>Right now he splits his time between New Orleans (Tulane) and Chicago, and he lived in Barcelona in fall 2025, so he adapts quickly to new places.</p>',
      next: ['roles', 'contact', 'education']
    },
    {
      id: 'education', q: 'Tell me about his education',
      kw: ['school', 'education', 'tulane', 'gpa', 'minor', 'degree', 'coursework', 'class', 'barcelona', 'study abroad', 'freeman'],
      a: '<ul><li><b>Tulane University, A.B. Freeman School of Business</b>: B.S. in Management, May 2027. Majors in Management and Marketing, minor in Psychology. GPA 3.65.</li>' +
        '<li>Alpha Lambda Delta Honor Society, Dean&rsquo;s List, Merit Scholarship.</li>' +
        '<li>Coursework: Strategic Consulting, Strategic Management, Financial Management, Negotiations, Sports Marketing, AI Tools.</li>' +
        '<li>Study abroad at ESCI-UPF in Barcelona, fall 2025.</li></ul>' +
        see([['education', 'Education']]),
      next: ['skills', 'roles', 'interests']
    },
    {
      id: 'skills', q: 'What are his top skills?',
      kw: ['skill', 'strength', 'good at', 'tools', 'hubspot', 'software', 'certif', 'capabilit'],
      a: '<p>Strongest at <b>strategy</b>, <b>leadership</b>, and <b>communication</b>, followed by marketing, finance, and research.</p>' +
        '<p>Tools: HubSpot CRM, Asana, Claude, ChatGPT, Microsoft Office, Google Workspace, Canva. Certifications: AI Literacy (Tulane), HubSpot Academy, Microsoft Excel.</p>' +
        see([['skills', 'Skills chart']]),
      next: ['finance', 'marketing', 'ai']
    },
    {
      id: 'contact', q: 'How do I reach Ben?',
      kw: ['contact', 'email', 'reach', 'get in touch', 'linkedin', 'resume', 'cv', 'talk to', 'interview', 'connect'],
      a: '<p>Email is fastest: <a href="mailto:beisen@tulane.edu">beisen@tulane.edu</a>.</p>' +
        '<p>You can also <a href="https://www.linkedin.com/in/ben-eisen/" target="_blank" rel="noopener">connect on LinkedIn</a>, <a href="assets/Ben-Eisen-Resume.pdf" download>download his resume</a>, or <a href="assets/Ben-Eisen.vcf" download>save his contact card</a>.</p>',
      next: ['roles', 'why', 'location']
    },
    {
      id: 'culture', q: 'What kind of team brings out his best?',
      kw: ['culture', 'team brings', 'environment', 'best work', 'ideal team', 'manager style', 'kind of team', 'workplace', 'motivat', 'thrive'],
      a: '<p>A motivated, collaborative team where people say what they think.</p>' +
        '<ul><li><b>Candor:</b> people who aren&rsquo;t afraid to speak their mind, and who welcome it back.</li>' +
        '<li><b>Shared drive, individual ownership:</b> a group that pushes each other forward while everyone delivers on their own work.</li>' +
        '<li><b>Curious, creative leaders:</b> teammates who want to keep learning and think differently about problems.</li></ul>' +
        '<p>He does his best work when the people around him raise the bar, and he tries to do the same for them.</p>',
      next: ['future', 'team', 'roles']
    },
    {
      id: 'future', q: 'Where does he see himself in 5 years?',
      kw: ['5 years', 'five years', 'will he be', 'future', 'long term', 'long-term', 'goal', 'ambition', 'aspire', 'career path', 'see himself'],
      a: '<p>Leading a team. He wants to be the person who brings a group together, keeps it motivated, and helps it do its best work, at a place where he genuinely enjoys the people around him.</p>' +
        '<p>He expects to be busy, in the good way: taking on more responsibility, learning fast, and growing as a leader and a professional. He already practices this as VP of Finance and as a head coach.</p>',
      next: ['culture', 'leadership', 'roles']
    },
    {
      id: 'challenge', q: 'What is the biggest challenge he has faced?',
      kw: ['biggest challenge', 'challenge', 'difficult', 'hard', 'obstacle', 'overcome', 'time management', 'busy', 'balance', 'prioritiz', 'juggl', 'stress', 'pressure'],
      a: '<p>Managing his time. He carries a full Freeman course load alongside Edoc, an executive role in Alpha Kappa Psi, coaching Special Olympics, and his friendships and personal growth.</p>' +
        '<p>How he handles it: life hands you a lot of marbles to juggle. Some are <b>glass</b>, the ones that would shatter if you dropped them. Others are <b>plastic</b> and will bounce back. The skill is telling them apart, then protecting the glass ones first.</p>' +
        '<p>That habit of prioritizing what truly matters, and not just what&rsquo;s loudest, is how he keeps every commitment and still delivers on each one.</p>',
      next: ['team', 'origin', 'leadership']
    },
    {
      id: 'origin', q: 'Why did he choose business?',
      kw: ['why business', 'choose business', 'major in', 'why did he major', 'majors', 'psychology', 'background', 'story', 'grew up', 'sneaker', 'entrepreneur', 'started'],
      a: '<p>He&rsquo;s been a businessperson since he was a kid: reselling sneakers, trading cards, and pitching his ideas to anyone who would listen.</p>' +
        '<p>His mix of majors fits how he thinks. <b>Management and Marketing</b> give him the business and the numbers. <b>Psychology</b> feeds his real interest: how people think, decide, and stay motivated.</p>' +
        '<p>Put together, he&rsquo;s a people-first strategist who can read a room, run the numbers, and lead a team toward a creative answer.</p>',
      next: ['why', 'culture', 'serve']
    },
    {
      id: 'serve', q: 'Why does he coach Special Olympics?',
      kw: ['special olympics', 'why special', 'volunteer', 'coach', 'coaching', 'give back', 'community', 'service', 'grandfather', 'grandpa', 'miracle league', 'allied', 'why does he'],
      a: '<p>It runs in the family. His grandfather leads work with the <b>Joe Nuxhall Miracle League</b> in the Cincinnati area, a nonprofit built so that every athlete, whatever their challenge, gets the chance to play. Ben has volunteered alongside him and watched that passion since he was a kid.</p>' +
        '<p>He carried it forward as a partner in <b>Allied Soccer</b> at Stevenson High School, which brings students with and without disabilities onto the same team, and now as a <b>head coach with Tulane Special Olympics</b>.</p>' +
        '<p>For him it&rsquo;s simple: he gets to share the sports he loves, support people, and lead a team, and it&rsquo;s one of the most rewarding things he does.</p>' +
        see([['leadership', 'Head coach role']]),
      next: ['leadership', 'team', 'origin']
    },
    {
      id: 'different', q: 'What makes him different from other candidates?',
      kw: ['different', 'unique', 'stand out from', 'compared to', 'other candidates', 'edge', 'special about', 'set him apart'],
      a: '<p>Three things you don&rsquo;t usually see together in a new grad:</p>' +
        '<ul><li><b>Executive exposure already.</b> He works directly with Edoc&rsquo;s CEO and President on a six-person Growth Team.</li>' +
        '<li><b>A builder&rsquo;s instinct.</b> He&rsquo;s been selling and pitching since he was a kid, and he built this whole site with AI as his partner.</li>' +
        '<li><b>People-first and numbers-fluent.</b> Psychology plus Management and Marketing: he can run a budget and read a room.</li></ul>' +
        see([['case-site', 'How he built this site'], ['case-scriptus', 'Edoc work']]),
      next: ['why', 'origin', 'ai']
    },
    {
      id: 'speaking', q: 'Is he a strong presenter?',
      kw: ['present', 'presentation', 'public speaking', 'speak', 'pitch', 'communicat', 'in front of', 'client facing', 'client-facing'],
      a: '<p>Yes, and he gets regular practice:</p>' +
        '<ul><li>Delivers <b>weekly financial briefings</b> to a 161-member chapter as VP of Finance.</li>' +
        '<li>Presented the &ldquo;why it works,&rdquo; implementation, and financials on the <b>TSA case</b>, and owned three sections of the <b>Qualico</b> capstone.</li>' +
        '<li>Pitched <b>2,500+ customers</b> live as a brand ambassador, converting 400+ of them.</li>' +
        '<li>Runs personalized <b>client check-in calls</b> at Edoc.</li></ul>' +
        see([['case-tsa', 'TSA case']]),
      next: ['consulting', 'leadership', 'sales']
    },
    {
      id: 'sales', q: 'Does he have sales experience?',
      kw: ['sales experience', 'sales', 'sell', 'selling', 'revenue', 'business development', 'bizdev', 'account executive', 'sdr', 'bdr', 'quota', 'lead gen'],
      a: '<p>Real, measurable sales experience:</p>' +
        '<ul><li><b>400+ leads converted</b> into purchases for nine national food and wellness brands.</li>' +
        '<li><b>10&ndash;15% conversion</b>, above national demo benchmarks.</li>' +
        '<li>At Edoc, he builds <b>client acquisition and retention</b> campaigns and researched 20+ target accounts for outreach.</li></ul>' +
        '<p>And it started early: reselling sneakers and trading cards as a kid.</p>',
      next: ['marketing', 'speaking', 'origin']
    },
    {
      id: 'advice', q: 'Can I give Ben some advice?',
      kw: ['advice', 'mentor', 'tip', 'recommend', 'suggest', 'wisdom', 'lesson'],
      a: '<p>He&rsquo;d love that. Ben is a senior and a constant learner, and he reads every note.</p>' +
        '<p>Use the <a href="#advice" data-jump="advice">Teach me something</a> box. It goes straight to his inbox, and your name is optional.</p>',
      next: ['contact', 'roles', 'culture']
    },
    {
      id: 'interests', q: 'What does Ben do for fun?',
      kw: ['fun', 'hobby', 'hobbies', 'interest', 'outside of work', 'free time', 'sports', 'weekend', 'personal'],
      a: '<p>He follows Manchester United and every Chicago team (Bears, Cubs, Bulls), lifts, skis whenever he can, and cooks. He&rsquo;s also an Alpha Epsilon Pi brother.</p>' +
        see([['interests', 'Off the clock']]),
      next: ['team', 'education', 'contact']
    }
  ];
  var byId = {}; KB.forEach(function (k) { byId[k.id] = k; });
  var ROLES = [['Consulting', 'consulting'], ['Finance', 'finance'], ['Marketing', 'marketing'], ['Strategy / Ops', 'strategy']];
  var START = ['why', 'different', 'consulting', 'culture', 'challenge', 'serve'];

  function scroll() { log.scrollTop = log.scrollHeight; }
  function add(cls, html) {
    var d = document.createElement('div');
    d.className = 'msg ' + cls; d.innerHTML = html; log.appendChild(d); scroll(); return d;
  }
  var GROUPS = [
    ['Fit and hiring', ['why', 'different', 'consulting', 'finance', 'marketing', 'strategy', 'sales', 'roles', 'location']],
    ['Experience', ['edoc', 'leadership', 'speaking', 'accomplish', 'ai', 'skills', 'education']],
    ['Who he is', ['culture', 'team', 'future', 'challenge', 'origin', 'serve', 'interests']],
    ['Get in touch', ['contact', 'advice']]
  ];
  function showAll() {
    var html = '<p>Here&rsquo;s everything you can ask me:</p>' + GROUPS.map(function (g) {
      return '<p class="q-group">' + g[0] + '</p><div class="q-list">' + g[1].filter(function (id) { return byId[id]; }).map(function (id) {
        return '<button type="button" data-q="' + id + '">' + byId[id].q + '</button>';
      }).join('') + '</div>';
    }).join('');
    var m = add('bot', html);
    m.querySelectorAll('[data-q]').forEach(function (b) { b.addEventListener('click', function () { ask(byId[b.dataset.q].q, b.dataset.q); }); });
    log.scrollTop = m.offsetTop - 12;
  }
  function chips(ids) {
    chipsBox.innerHTML = '';
    var all = document.createElement('button');
    all.type = 'button'; all.className = 'ask-all'; all.textContent = 'See all questions';
    all.addEventListener('click', function () { if (!busy) showAll(); });
    chipsBox.appendChild(all);
    ids.forEach(function (id) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'ask-chip'; b.textContent = byId[id].q;
      b.addEventListener('click', function () { ask(byId[id].q, id); });
      chipsBox.appendChild(b);
    });
  }
  var busy = false;
  function reply(entry, fallbackQ) {
    busy = true;
    var t = add('bot typing', '<i></i><i></i><i></i>');
    setTimeout(function () {
      t.remove();
      if (entry) {
        var m = add('bot', entry.a);
        if (!reduce) { m.style.opacity = 0; m.style.transform = 'translateY(6px)'; m.style.transition = 'opacity .35s, transform .35s'; requestAnimationFrame(function () { m.style.opacity = 1; m.style.transform = 'none'; }); }
        chips(entry.next);
        var q = m.previousElementSibling;
        log.scrollTop = Math.max(0, (q ? q.offsetTop : m.offsetTop) - 12);
        busy = false; return;
      } else {
        add('bot', '<p>I don&rsquo;t have a solid answer to &ldquo;' + escapeHtml(fallbackQ) + '&rdquo; from Ben&rsquo;s site, and I&rsquo;d rather not guess. Ben can answer it directly: <a href="mailto:beisen@tulane.edu">beisen@tulane.edu</a>.</p><p>Or try one of these:</p>');
        chips(['why', 'roles', 'advice']);
      }
      scroll(); busy = false;
    }, reduce ? 150 : 650 + Math.random() * 400);
  }
  function escapeHtml(s) { return s.replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function match(q) {
    var t = ' ' + q.toLowerCase().replace(/[^a-z0-9&+ ]/g, ' ').replace(/\s+/g, ' ') + ' ';
    var best = null, score = 0;
    KB.forEach(function (k) {
      var s = 0;
      k.kw.forEach(function (w) {
        var hit = w.length <= 4 ? t.indexOf(' ' + w + ' ') !== -1 : t.indexOf(w) !== -1;
        if (hit) s += w.indexOf(' ') !== -1 ? 3 : (w.length > 4 ? 2 : 1);
      });
      if (s > score) { score = s; best = k; }
    });
    return score > 0 ? best : null;
  }
  function ask(text, id) {
    if (busy || !text.trim()) return;
    add('me', escapeHtml(text.trim()));
    reply(id ? byId[id] : match(text), text.trim());
  }

  var started = false;
  function start() {
    if (started) return; started = true;
    add('bot', '<p>Hi! I can answer questions about Ben&rsquo;s experience, projects, and fit for your team. Everything I say comes from his resume and the work on this site.</p><p>What are you hiring for?</p>' +
      '<div class="ask-roles">' + ROLES.map(function (r) { return '<button type="button" data-role="' + r[1] + '">' + r[0] + '</button>'; }).join('') + '</div>');
    log.querySelectorAll('[data-role]').forEach(function (b) {
      b.addEventListener('click', function () { var k = byId[b.dataset.role]; ask('I’m hiring for ' + b.textContent.toLowerCase() + '. How would Ben fit?', k.id); });
    });
    chips(START);
  }

  /* Phones: the panel is a bottom sheet. Size it to the *visible* viewport so
     the on-screen keyboard never covers the input or pushes the header away,
     and lock the page behind it so scrolls stay inside the chat. */
  var phone = window.matchMedia('(max-width: 900px)');
  var vv = window.visualViewport;
  if (phone.matches) input.placeholder = 'Ask anything about Ben';
  function fit() {
    if (panel.hidden || !phone.matches) { panel.style.top = ''; panel.style.height = ''; return; }
    var h = vv ? vv.height : window.innerHeight;
    var top = (vv ? vv.offsetTop : 0) + Math.max(10, Math.round(h * 0.08));
    panel.style.top = top + 'px';
    panel.style.height = ((vv ? vv.offsetTop : 0) + h - top) + 'px';
  }
  if (vv) { vv.addEventListener('resize', fit); vv.addEventListener('scroll', fit); }
  window.addEventListener('resize', fit);
  var lockY = 0;
  function lock(on) {
    var root = document.documentElement;
    if (on && phone.matches) {
      lockY = window.scrollY;
      root.classList.add('ask-open');
      document.body.style.top = -lockY + 'px';
    } else if (!on && root.classList.contains('ask-open')) {
      root.classList.remove('ask-open');
      document.body.style.top = '';
      window.scrollTo({ top: lockY, behavior: 'instant' });
    }
  }

  var openers = Array.prototype.slice.call(document.querySelectorAll('.ask-launch, .dock-ask, .menu-ask'));
  function open() {
    var m = document.querySelector('.site-menu'); if (m && m.open) m.close();
    panel.hidden = false; start(); lock(true); fit();
    if (launch) { launch.classList.add('hide'); launch.setAttribute('aria-expanded', 'true'); }
    if (window.matchMedia('(pointer: fine)').matches) input.focus();
  }
  function close() {
    input.blur();
    panel.hidden = true; lock(false); fit();
    if (launch) { launch.classList.remove('hide'); launch.setAttribute('aria-expanded', 'false'); if (!phone.matches) launch.focus(); }
  }
  openers.forEach(function (b) {
    b.addEventListener('click', function (e) {
      e.preventDefault(); e.stopPropagation();
      if (panel.hidden) setTimeout(open, 0); else close();
    });
  });
  panel.querySelector('.ask-close').addEventListener('click', close);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !panel.hidden && !document.querySelector('dialog[open]')) close(); });
  form.addEventListener('submit', function (e) { e.preventDefault(); var v = input.value; input.value = ''; ask(v); });
  log.addEventListener('click', function (e) {
    var a = e.target.closest('a[data-jump]'); if (!a) return;
    e.preventDefault();
    var target = document.getElementById(a.dataset.jump);
    if (window.matchMedia('(max-width: 900px)').matches) close();
    if (target) target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
  });
  window.askBen = open;
})();
