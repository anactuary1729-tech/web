import { CatalogData, SubjectCode, ActuarialSubject } from './types';

const SUBJECT_META: { code: SubjectCode; name: string; category: string; price: number; desc: string }[] = [
  { code: 'CM1', name: 'Actuarial Mathematics 1', category: 'Core Principles', price: 249, desc: 'Theory of interest rates, cashflow models, annuities, assurances, reserves, and mortality tables.' },
  { code: 'CM2', name: 'Financial Engineering & Loss Reserving', category: 'Core Principles', price: 249, desc: 'Stochastic interest rate models, Black-Scholes option pricing, ruin theory, and run-off triangles.' },
  { code: 'CS1', name: 'Actuarial Statistics 1', category: 'Core Principles', price: 229, desc: 'Probability distributions, Bayesian statistics, generalized linear models (GLMs), and R programming.' },
  { code: 'CS2', name: 'Risk Modelling & Survival Analysis', category: 'Core Principles', price: 259, desc: 'Markov chains, Markov jump processes, survival models, graduation, time series, and copulas.' },
  { code: 'CB1', name: 'Business Finance', category: 'Core Principles', price: 179, desc: 'Corporate governance, taxation, capital structure, financial reporting, and IFRS 17 accounting.' },
  { code: 'CB2', name: 'Business Economics', category: 'Core Principles', price: 179, desc: 'Microeconomic market structures, macroeconomic policy, central banking, and international trade.' },
  { code: 'SP7', name: 'General Insurance Reserving & Capital Modelling', category: 'Specialist Principles', price: 329, desc: 'Stochastic reserving (Mack & ODP Bootstrap), Solvency II internal models, and Lloyd’s syndicate capital.' },
  { code: 'SP8', name: 'General Insurance: Pricing', category: 'Specialist Principles', price: 329, desc: 'Experience & exposure rating, credibility theory, Multivariate GLMs, cat modelling, and reinsurance pricing.' },
  { code: 'CP1', name: 'Actuarial Practice', category: 'Core Practices', price: 399, desc: 'Actuarial Control Cycle, risk management, asset-liability management, pricing, and reserving across all practice areas.' },
  { code: 'CP2', name: 'Modelling Practice', category: 'Core Practices', price: 299, desc: 'Excel spreadsheet engineering, audit trail documentation, model validation, and executive summary reporting.' },
];

const buildDefaultSubjects = (): Record<SubjectCode, ActuarialSubject> => {
  const map = {} as Record<SubjectCode, ActuarialSubject>;

  SUBJECT_META.forEach((meta) => {
    map[meta.code] = {
      code: meta.code,
      name: meta.name,
      category: meta.category,
      description: meta.desc,
      coursePriceGBP: meta.price,
      notes: [
        {
          id: `${meta.code}-n1`,
          title: `${meta.code} Core Syllabus & Formula Sheet`,
          topic: 'Module 1: Foundations',
          content: `Comprehensive revision notes for ${meta.code} (${meta.name}). Focuses on core IFoA syllabus objectives, key derivations, and high-yield exam command words. Always state your assumptions clearly and define all notation before substituting numerical values.`,
          isPremium: false,
        },
        {
          id: `${meta.code}-n2`,
          title: `${meta.code} Advanced Exam Technique & Past Paper Walkthroughs`,
          topic: 'Module 2: Exam Mastery',
          content: `Premium deep-dive guide for ${meta.code}. Includes step-by-step breakdowns of higher-order application questions, common examiner pitfalls, and time-management strategies to pass comfortably on your first sitting.`,
          isPremium: true,
        },
      ],
      questions: [
        {
          id: `${meta.code}-q1`,
          topic: 'Core Concept Application',
          question: `[${meta.code} Exam Style - 6 Marks] Define the primary actuarial assumptions underlying ${meta.name} and explain how parameter uncertainty impacts capital or pricing decisions.`,
          solution: `1. Data Quality & Credibility (1.5 marks): Historical data must be adjusted for inflation and structural shifts.\n2. Model Risk (1.5 marks): Choosing an inappropriate distribution understates tail risk.\n3. Sensitivity Testing (1.5 marks): Stress and scenario testing quantify parameter sensitivity.\n4. Margin for Uncertainty (1.5 marks): Prudent margins are added when setting reserves or capital requirements.`,
          isPremium: false,
        },
        {
          id: `${meta.code}-q2`,
          topic: 'Advanced Synthesis Problem',
          question: `[${meta.code} Exam Style - 12 Marks] A UK insurer is reviewing its ${meta.code} framework following a shift in economic conditions. Propose a comprehensive monitoring and mitigation strategy.`,
          solution: `Full 12-mark structured solution covering stakeholder appetites, regulatory constraints (PRA/FCA), stochastic calibration, reinsurance optimization, and Actuarial Control Cycle monitoring feedback loops.`,
          isPremium: true,
        },
      ],
      quiz: [
        {
          id: `${meta.code}-qz1`,
          question: `In the context of IFoA exam ${meta.code}, which step comes FIRST in the Actuarial Control Cycle?`,
          options: [
            'Specify the problem and understand the general commercial and economic environment',
            'Calibrate stochastic parameters without checking data quality',
            'Publish final results prior to peer review',
            'Ignore regulatory capital constraints',
          ],
          correctIndex: 0,
          explanation: 'The Actuarial Control Cycle always begins with understanding the general commercial environment and clearly specifying the problem.',
        },
        {
          id: `${meta.code}-qz2`,
          question: `When answering a 10-mark 'Discuss' question in ${meta.code}, what is the recommended time allocation in a 3 hour 20 minute IFoA exam?`,
          options: ['5 minutes', '18 to 20 minutes', '45 minutes', '60 minutes'],
          correctIndex: 1,
          explanation: 'With 200 minutes for 100 marks, you have approximately 2 minutes per mark (18–20 minutes for a 10-mark question).',
        },
      ],
      videos: [
        {
          id: `${meta.code}-v1`,
          title: `Module 1: ${meta.code} Syllabus Overview & Core Derivations`,
          duration: '48 mins',
          videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
        },
        {
          id: `${meta.code}-v2`,
          title: `Module 2: ${meta.code} Past Paper Live Walkthrough`,
          duration: '65 mins',
          videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
        },
      ],
    };
  });

  return map;
};

export const INITIAL_CATALOG: CatalogData = {
  subjects: buildDefaultSubjects(),
  worksheets: [
    {
      id: 'ws-gcse-1',
      title: 'GCSE Higher Tier: Algebraic Proof, Quadratics & Circle Theorems',
      level: 'GCSE',
      examBoard: 'Edexcel',
      topic: 'Algebra & Geometry (Grades 7–9)',
      priceGBP: 9.99,
      samplePreview: 'Q1 (4 Marks): Prove algebraically that the sum of the squares of any two consecutive odd integers leaves a remainder of 2 when divided by 8.',
      pdfDataUrl: '',
      fileName: 'GCSE_Higher_Grade9_Booster_Pack.pdf',
    },
    {
      id: 'ws-alevel-1',
      title: 'A-Level Pure Maths: Parametric Differentiation & Integration by Parts',
      level: 'A-Level',
      examBoard: 'Edexcel',
      topic: 'Year 2 Calculus Mastery',
      priceGBP: 14.99,
      samplePreview: 'Q1 (8 Marks): A curve C has parametric equations x = 2t + ln(t), y = t^2 - 4t (t > 0). Find the exact coordinates of the stationary point on C.',
      pdfDataUrl: '',
      fileName: 'ALevel_Calculus_Mastery_Worked_Solutions.pdf',
    },
    {
      id: 'ws-alevel-2',
      title: 'A-Level Statistics & Mechanics: Normal Approximations & Connected Particles',
      level: 'A-Level',
      examBoard: 'AQA',
      topic: 'Applied Mathematics',
      priceGBP: 12.99,
      samplePreview: 'Q1 (7 Marks): Two particles P (4kg) and Q (6kg) are connected by a light inextensible string passing over a smooth fixed pulley...',
      pdfDataUrl: '',
      fileName: 'ALevel_Stats_Mechanics_Exam_Pack.pdf',
    },
  ],
  blogs: [
    {
      id: 'blog-1',
      brand: 'actuary',
      title: 'How to Combine CM1 and CS1 in a Single IFoA Exam Sitting',
      excerpt: 'A realistic 16-week study schedule for balancing Actuarial Mathematics and R Statistical Programming.',
      content: 'Sitting CM1 and CS1 together is a popular route for graduate actuarial trainees. The key is starting Paper B (Excel for CM1, R for CS1) practice from Week 3 rather than waiting until the final month...',
      author: 'Fellow of the IFoA (FIA)',
      date: '15 Oct 2026',
      readTime: '6 min read',
    },
    {
      id: 'blog-2',
      brand: 'mathmentor',
      title: '5 Mistakes That Cost A-Level Maths Students an A* Every Summer',
      excerpt: 'From missing "+ C" in differential equations to sign errors in mechanics resolution.',
      content: 'Every June exam series, thousands of capable A-Level students miss out on an A* by 3 to 5 marks. Here is how to build bulletproof checking habits in the final 15 minutes of your paper...',
      author: 'MathMentor Lead Tutor',
      date: '12 Oct 2026',
      readTime: '5 min read',
    },
  ],
};