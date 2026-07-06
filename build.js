/**
 * build.js
 * Generates "Methodology.docx" — Section 3: Methodology
 *   3.1 Data Cleaning & Integration
 *   3.2 Feature Engineering
 *   3.3 Model Training & Evaluation
 *
 * Theme: Navy/grey professional report theme, Calibri, US Letter.
 * Run: npm install docx && node build.js
 */

const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  ImageRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  ShadingType,
  BorderStyle,
  AlignmentType,
  VerticalAlign,
  LevelFormat,
  PageBreak,
  Math,
  MathRun,
  MathSuperScript,
  MathSubScript,
  MathFraction,
} = require("docx");
const fs = require("fs");

/* ------------------------------------------------------------------ */
/*  THEME CONSTANTS                                                    */
/* ------------------------------------------------------------------ */

const NAVY = "1F3864";
const WHITE = "FFFFFF";
const ROW_ALT = "F2F5FB";
const BORDER_GREY = "B7BFCB";
const CAPTION_GREY = "555555";
const FONT = "Calibri";

const BODY_SIZE = 21;
const TABLE_BODY_SIZE = 19;
const TABLE_HEADER_SIZE = 19;
const CAPTION_SIZE = 18;
const H1_SIZE = 32;
const H2_SIZE = 27;
const H3_SIZE = 24;

const PAGE_WIDTH = 12240;
const PAGE_HEIGHT = 15840;
const MARGIN_TB = 1080;
const MARGIN_LR = 1200;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_LR * 2;

const CELL_MARGIN = { top: 60, bottom: 60, left: 100, right: 100 };
const CELL_BORDER = {
  style: BorderStyle.SINGLE,
  size: 4,
  color: BORDER_GREY,
};
const ALL_BORDERS = {
  top: CELL_BORDER,
  bottom: CELL_BORDER,
  left: CELL_BORDER,
  right: CELL_BORDER,
};

/* ------------------------------------------------------------------ */
/*  HELPERS                                                           */
/* ------------------------------------------------------------------ */

function body(text, opts = {}) {
  const runsInput = Array.isArray(text) ? text : [{ text }];
  return new Paragraph({
    spacing: { line: 276, after: 160, ...(opts.spacing || {}) },
    alignment: opts.alignment || AlignmentType.JUSTIFIED,
    children: runsInput.map(
      (r) =>
        new TextRun({
          text: r.text,
          bold: r.bold || false,
          italics: r.italics || false,
          font: FONT,
          size: BODY_SIZE,
          subScript: r.sub || false,
          superScript: r.sup || false,
        })
    ),
  });
}

function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 300, after: 150 },
    children: [
      new TextRun({ text, bold: true, color: NAVY, font: FONT, size: H1_SIZE }),
    ],
  });
}

function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 300, after: 150 },
    children: [
      new TextRun({ text, bold: true, color: NAVY, font: FONT, size: H2_SIZE }),
    ],
  });
}

function h3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 260, after: 120 },
    children: [
      new TextRun({ text, bold: true, color: NAVY, font: FONT, size: H3_SIZE }),
    ],
  });
}

function caption(text) {
  return new Paragraph({
    alignment: AlignmentType.LEFT,
    spacing: { before: 60, after: 240 },
    children: [
      new TextRun({ text, italics: true, color: CAPTION_GREY, font: FONT, size: CAPTION_SIZE }),
    ],
  });
}

function bullet(text) {
  return new Paragraph({
    numbering: { reference: "bullet-list", level: 0 },
    spacing: { line: 276, after: 100 },
    children: [new TextRun({ text, font: FONT, size: BODY_SIZE })],
  });
}

/* ------------------------------------------------------------------ */
/*  MATH FORMULA HELPERS                                              */
/* ------------------------------------------------------------------ */

function mathFormula(parts) {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 180, after: 180, line: 276 },
    children: [
      new Math({
        children: Array.isArray(parts) ? parts : [new MathRun(parts)],
      }),
    ],
  });
}

function mathFraction(num, den) {
  return new MathFraction({
    numerator: [new MathRun(num)],
    denominator: [new MathRun(den)],
  });
}

function mathSuper(base, sup) {
  return new MathSuperScript({
    children: [new MathRun(base)],
    superScript: [new MathRun(sup)],
  });
}

/* ------------------------------------------------------------------ */
/*  TABLE / FIGURE HELPERS                                           */
/* ------------------------------------------------------------------ */

function makeTable(headers, rows, colWidths) {
  const headerRow = new TableRow({
    tableHeader: true,
    children: headers.map(
      (text, i) =>
        new TableCell({
          width: { size: colWidths[i], type: WidthType.DXA },
          margins: CELL_MARGIN,
          borders: ALL_BORDERS,
          verticalAlign: VerticalAlign.CENTER,
          shading: { type: ShadingType.CLEAR, fill: NAVY, color: "auto" },
          children: [
            new Paragraph({
              alignment: AlignmentType.LEFT,
              spacing: { line: 240 },
              children: [
                new TextRun({ text, bold: true, color: WHITE, font: FONT, size: TABLE_HEADER_SIZE }),
              ],
            }),
          ],
        })
    ),
  });

  const bodyRows = rows.map((row, rIdx) => {
    const fill = rIdx % 2 === 0 ? WHITE : ROW_ALT;
    return new TableRow({
      children: row.map(
        (text, cIdx) =>
          new TableCell({
            width: { size: colWidths[cIdx], type: WidthType.DXA },
            margins: CELL_MARGIN,
            borders: ALL_BORDERS,
            verticalAlign: VerticalAlign.CENTER,
            shading: { type: ShadingType.CLEAR, fill, color: "auto" },
            children: [
              new Paragraph({
                alignment: AlignmentType.LEFT,
                spacing: { line: 240 },
                children: [
                  new TextRun({ text, font: FONT, size: TABLE_BODY_SIZE }),
                ],
              }),
            ],
          })
      ),
    });
  });

  return new Table({
    width: { size: CONTENT_WIDTH, type: WidthType.DXA },
    columnWidths: colWidths,
    rows: [headerRow, ...bodyRows],
  });
}

function insertFigure(filePath, widthDxa, heightDxa) {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 120, after: 120 },
    children: [
      new ImageRun({
        type: "png",
        data: fs.readFileSync(filePath),
        transformation: { width: widthDxa, height: heightDxa },
      }),
    ],
  });
}

function workflowDiagram() {
  const steps = [
    { title: "Load Data",          sub: "214,318 rows" },
    { title: "Clean & Filter",     sub: "drop missing / price" },
    { title: "Feature Engineering",sub: "title / brand / price" },
    { title: "Train / Test Split", sub: "80:20 stratified" },
    { title: "5-Fold CV Training", sub: "4 models tuned" },
    { title: "Evaluate & Deploy",  sub: "test set best model" },
  ];
  const n = steps.length;
  const arrowW = 180;
  const stepW = globalThis.Math.floor((CONTENT_WIDTH - arrowW * (n - 1)) / n);
  const colWidths = [];
  for (let i = 0; i < n; i++) {
    if (i > 0) colWidths.push(arrowW);
    colWidths.push(stepW);
  }

  function stepCell(s, fill) {
    return new TableCell({
      width: { size: stepW, type: WidthType.DXA },
      margins: { top: 60, bottom: 60, left: 50, right: 50 },
      borders: ALL_BORDERS,
      verticalAlign: VerticalAlign.CENTER,
      shading: { type: ShadingType.CLEAR, fill, color: "auto" },
      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER, spacing: { line: 240, after: 0 },
          children: [new TextRun({ text: s.title, bold: true, font: FONT, size: 17, color: NAVY })],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER, spacing: { line: 220, before: 20 },
          children: [new TextRun({ text: s.sub, font: FONT, size: 15, color: CAPTION_GREY, italics: true })],
        }),
      ],
    });
  }

  function arrowCell() {
    return new TableCell({
      width: { size: arrowW, type: WidthType.DXA },
      margins: { top: 0, bottom: 0 },
      borders: {
        top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE },
        left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE },
      },
      verticalAlign: VerticalAlign.CENTER,
      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER, spacing: { line: 240 },
          children: [new TextRun({ text: "\u2192", font: FONT, size: 26, color: NAVY, bold: true })],
        }),
      ],
    });
  }

  const rowCells = [];
  for (let i = 0; i < n; i++) {
    if (i > 0) rowCells.push(arrowCell());
    rowCells.push(stepCell(steps[i], i % 2 === 0 ? "F2F5FB" : "FFFFFF"));
  }

  return new Table({
    width: { size: CONTENT_WIDTH, type: WidthType.DXA },
    columnWidths: colWidths,
    rows: [new TableRow({ children: rowCells })],
  });
}

/* ------------------------------------------------------------------ */
/*  DOCUMENT CONTENT                                                  */
/* ------------------------------------------------------------------ */

const children = [];

/* ========================= 3. METHODOLOGY ========================== */
children.push(h1("3. Methodology"));

children.push(body(
  "This chapter describes the complete methodology followed to build and evaluate the machine learning models used in this project. The methodology is organised into three major stages. Section 3.1 (Data Cleaning & Integration) covers the acquisition, cleaning, and merging of two fashion datasets from distinct markets into a single model-ready corpus. Section 3.2 (Feature Engineering) describes how listing-time attributes were transformed into the final feature set. Section 3.3 (Model Training & Evaluation) presents the theoretical basis, training procedure, cross-validation strategy, and model selection rationale for every algorithm experimented with in this study."
));

/* ================================================================== */
/*  3.1 DATA CLEANING & INTEGRATION                                    */
/* ================================================================== */
children.push(h2("3.1 Data Cleaning & Integration"));

children.push(body(
  "Real-world datasets are rarely analysis-ready. The data used in this project was sourced from two independent fashion marketplaces — Amazon Fashion (US) and Myntra Fashion (India) — each with its own schema, currency, taxonomy, and data quality profile. A central methodological challenge was therefore to clean each dataset independently and then harmonise both into a single common schema without introducing inconsistencies. The following subsections describe the source datasets, the cleaning pipeline applied to each, the harmonisation and merging process, and a critical finding regarding data leakage."
));

/* ---- 3.1.1 Dataset Sources & Description ---- */
children.push(h3("3.1.1 Dataset Sources"));

children.push(body(
  "Two independent datasets were used. The first, from the McAuley-Lab Amazon-Reviews-2023 collection (subset raw_meta_Amazon_Fashion), contains 826,108 product metadata records for Amazon Fashion listings in the US marketplace. The second, from the Kaggle Myntra Fashion Dataset, contains 526,564 product listings from Myntra, India's largest fashion e-commerce platform. After independent cleaning and merging, the final combined dataset contains 214,318 records with 11 attributes. Tables 3.1 and 3.2 summarise the merged dataset and its feature dictionary."
));

children.push(
  makeTable(
    ["Property", "Description"],
    [
      ["Sources", "McAuley-Lab Amazon-Reviews-2023 (US) + Kaggle Myntra Fashion Dataset (India)"],
      ["Raw records (US + IN)", "826,108 + 526,564 = 1,352,672"],
      ["Final merged records", "214,318"],
      ["Features", "10 shared attributes + 1 binary target"],
      ["Target variable", "is_trending_binary (1 if average_rating >= 4.2, else 0)"],
      ["Data type", "Structured / tabular"],
      ["Missing values (final)", "0 (after full cleaning pipeline)"],
      ["Duplicate records", "0"],
    ],
    [3280, 6560]
  )
);
children.push(caption("Table 3.1 — Summary description of the merged fashion dataset."));

children.push(
  makeTable(
    ["Column", "Type", "Description"],
    [
      ["title", "Text", "Product title / description"],
      ["gender", "Categorical", "Target gender (Men / Women / Youth)"],
      ["individual_category", "Categorical", "Product type (106 unique)"],
      ["price_usd", "Numeric", "Price in USD (converted from INR for Indian listings)"],
      ["brand", "Categorical", "Brand name (13,214 raw, collapsed to 1,371 by grouping)"],
      ["average_rating", "Numeric", "Average customer rating (1.0 \u2013 5.0)"],
      ["rating_number", "Numeric", "Number of ratings received"],
      ["is_trending", "Categorical", "Trending label (Yes / No) derived from rating >= 4.2"],
      ["source_market", "Categorical", "Origin (US = Amazon, IN = Myntra)"],
      ["is_trending_binary", "Binary", "Target variable (1 = trending, 0 = not trending)"],
    ],
    [2600, 2400, 4840]
  )
);
children.push(caption("Table 3.2 — Feature dictionary of the merged fashion dataset."));

/* ---- 3.1.2 Cross-Market Data Cleaning Pipeline ---- */
children.push(h3("3.1.2 Cross-Market Data Cleaning Pipeline"));

children.push(body(
  "Each dataset was cleaned independently through a structured multi-step pipeline. The guiding principle was to converge both datasets on an identical 10-column common schema so they could be concatenated without ambiguity. Table 3.3 presents the parallel pipeline stages for both sources side by side."
));

children.push(
  makeTable(
    ["Step", "Amazon (US)", "Myntra (IN)"],
    [
      ["Raw records", "826,108", "526,564"],
      ["Initial columns", "16 (incl. sparse/media columns)", "13 (better structure but high missingness)"],
      ["Drop useless columns", "bought_together, subtitle, author, images, videos, main_category (100% empty or media)", "URL, Product_id (no analytical value)"],
      ["Price cleaning", "Parse free-text price to numeric USD; drop missing / non-positive prices", "Convert INR to USD at 83.5 rate; cap at $500; drop null/zero"],
      ["Rating filter", "Keep only rating_number >= 5 (ensure statistical reliability)", "Keep only rows with non-null Ratings AND Reviews > 0"],
      ["Gender handling", "Extract from details JSON, fallback to title; harmonise to Men / Women / Youth", "Map category_by_Gender (Boys/Girls \u2192 Youth); drop unmapped"],
      ["Category", "Infer via 19-keyword dictionary from title", "Preserve native taxonomy (87\u201392 categories)"],
      ["Brand / ID", "brand from store field; native parent_asin", "brand from BrandName; surrogate parent_asin (MYNTRA_<n>)"],
      ["Target label", "is_trending = (average_rating >= 4.2)", "Same threshold applied"],
      ["Final records", "28,435", "185,957"],
    ],
    [2200, 3800, 3800]
  )
);
children.push(caption("Table 3.3 \u2014 Parallel cleaning pipeline stages for Amazon (US) and Myntra (IN) datasets."));

/* ---- 3.1.3 Schema Harmonisation & Merging ---- */
children.push(h3("3.1.3 Schema Harmonisation and Merging"));

children.push(body(
  "Before concatenation, both datasets were validated column-by-column to confirm identical names, order, and data types. Two post-merge corrections were required. First, the Amazon pipeline had used \"Unisex\" for ambiguous gender values while Myntra used \"Youth\" for its equivalent bucket (Boys/Girls); all \"Unisex\" values were remapped to \"Youth\" so the combined gender field has exactly three values. Second, the price cap of $500 had been applied inconsistently: 74 Amazon luxury-item rows (watches, designer handbags) with prices up to $6,200 survived the individual cleaning but violated the cap after merging; a strict $500 filter was reapplied across the combined dataset. After these corrections, the final dataset contains 214,318 records with zero nulls and zero duplicates."
));

children.push(
  makeTable(
    ["Metric", "Value"],
    [
      ["Final rows", "214,318"],
      ["Market split", "India 185,957 (86.8%) / US 28,361 (13.2%)"],
      ["Gender split", "Women 59.0% / Men 34.8% / Youth 6.1%"],
      ["Target split", "Trending 53.4% / Not trending 46.6%"],
      ["Price range", "$0.01 \u2013 $499.95"],
      ["Unique categories", "106 (19 inferred + 87 native, zero direct overlap)"],
      ["Unique brands", "13,214"],
    ],
    [3200, 6640]
  )
);
children.push(caption("Table 3.4 — Final combined dataset summary after merging and post-merge corrections."));

/* ---- 3.1.4 Data Leakage Finding ---- */
children.push(h3("3.1.4 Data Leakage Finding"));

children.push(body(
  [{ text: "A critical methodological discovery was made during initial data inspection.", bold: true },
    { text: " The target variable is_trending_binary is defined as a deterministic threshold on average_rating: products with average_rating >= 4.2 are labelled trending (1), and those below 4.2 are labelled not trending (0). This creates a perfect separation between the two classes with zero overlap, as shown in Table 3.5." }]
));

children.push(
  makeTable(
    ["Class", "Min Rating", "Max Rating"],
    [
      ["Not Trending (0)", "1.0", "4.1"],
      ["Trending (1)", "4.2", "5.0"],
    ],
    [3200, 3200, 3200]
  )
);
children.push(caption("Table 3.5 — Rating range by target class, confirming a perfect deterministic split at 4.2."));

children.push(body(
  "Including average_rating as a feature would therefore produce a trivially perfect classifier (AUC ~ 0.99) that merely rediscovered the threshold rule. Such a model has zero real-world utility because at the point of listing, a product has no ratings yet. The primary methodological decision arising from this finding is that average_rating is excluded from the feature set entirely. The model is trained exclusively on listing-time metadata. The feature rating_number (review count) is retained, however, because its correlation with the target is only ~0.03 and it is not deterministic of the label; it serves as a legitimate proxy for listing maturity and market exposure."
));

/* ---- 3.1.5 Exploratory Data Analysis ---- */
children.push(h3("3.1.5 Exploratory Data Analysis"));

children.push(body(
  "EDA was performed on the cleaned dataset to understand distributions, identify patterns, and inform feature engineering. Six diagnostic plots were produced: target balance, log-price distribution, trending rate by gender, top categories by trending rate, price distribution by trending status, and a correlation heatmap of numeric features."
));

children.push(insertFigure("graphs/01_target_balance.png", 500, 350));
children.push(caption("Figure 3.1 — Target variable distribution: 53.4% trending (1), 46.6% not trending (0)."));

children.push(insertFigure("graphs/02_log_price_distribution.png", 600, 375));
children.push(caption("Figure 3.2 — Log-transformed price distribution (log(1 + price_usd))."));

children.push(insertFigure("graphs/03_trending_rate_by_gender.png", 500, 350));
children.push(caption("Figure 3.3 — Trending rate by gender segment."));

children.push(insertFigure("graphs/04_top_categories_trending_rate.png", 600, 400));
children.push(caption("Figure 3.4 — Top 20 product categories by trending rate (minimum 100 products)."));

children.push(insertFigure("graphs/05_price_by_trending.png", 500, 375));
children.push(caption("Figure 3.5 — Log price distribution by trending status."));

children.push(insertFigure("graphs/06_correlation_heatmap.png", 600, 400));
children.push(caption("Figure 3.6 — Pearson correlation heatmap of numeric features (price_usd, rating_number, target)."));

/* ---- 3.1.6 Train-Test Split ---- */
children.push(h3("3.1.6 Train\u2013Test Split"));

children.push(body(
  "After cleaning and EDA, the dataset was partitioned into a training set and a held-out test set using stratified random sampling with a fixed random seed (42) to preserve the class distribution across both partitions and ensure reproducibility. An 80:20 split ratio was used."
));

children.push(
  makeTable(
    ["Partition", "Proportion", "Records", "Purpose"],
    [
      ["Training set", "80%", "171,454", "Model fitting and hyperparameter tuning (5-fold CV)"],
      ["Test set", "20%", "42,864", "Final held-out performance evaluation"],
    ],
    [2400, 1800, 2400, 3240]
  )
);
children.push(caption("Table 3.6 \u2014 Train\u2013test split summary."));

/* ================================================================== */
/*  3.2 FEATURE ENGINEERING                                           */
/* ================================================================== */
children.push(new Paragraph({ children: [new PageBreak()] }));
children.push(h2("3.2 Feature Engineering"));

children.push(body(
  "All engineered features are derived exclusively from listing-time information \u2014 data known before a product accumulates customer reviews. This constraint is essential because the model is intended to predict trending potential at the point of listing, not retrospectively. The feature set spans five categories: title-derived features, price transformations, review-volume proxies, brand grouping, and categorical encodings."
));

/* ---- 3.2.1 Title-Derived Features ---- */
children.push(h3("3.2.1 Title-Derived Features"));
children.push(body(
  "Four features were extracted from the product title text. title_length (character count) and title_word_count (word count) capture the descriptive richness of a listing. Three binary keyword flags \u2014 kw_women (contains \"women\", \"woman\", or \"ladies\"), kw_men (contains \"men\", \"man\", or \"male\"), and kw_kids (contains \"kids\", \"children\", \"boy\", \"girl\", or \"youth\") \u2014 capture the intended audience as expressed in the listing copy, complementing the structured gender field."
));

/* ---- 3.2.2 Price & Review Transformations ---- */
children.push(h3("3.2.2 Price and Review-Volume Transformations"));
children.push(body(
  "The price_usd feature is heavily right-skewed (a small number of expensive items). A log transform compresses the dynamic range and makes the distribution more symmetric:"
));
children.push(mathFormula("log_price = ln(1 + price_usd)"));
children.push(body(
  "The review count rating_number is similarly right-skewed, with some products having tens of thousands of reviews. The log transform dampens extreme outliers while preserving the signal that more-reviewed products are more established:"
));
children.push(mathFormula("log_rating_count = ln(1 + rating_number)"));

/* ---- 3.2.3 Brand Grouping ---- */
children.push(h3("3.2.3 Brand Grouping"));
children.push(body(
  "The raw brand field contains 13,195 unique values, many appearing only once or twice. Brands with fewer than 10 occurrences are collapsed into a single \"Other\" category, reducing the cardinality to 1,371. This is a deliberate bias\u2013variance trade-off: rare brands offer no statistically reliable signal and add noise, while grouping them preserves the structure of high-frequency brands and pools rare ones into a category the model can learn collectively."
));

/* ---- 3.2.4 Categorical Encoding ---- */
children.push(h3("3.2.4 Categorical Encoding"));
children.push(body(
  "Three encoding strategies were applied depending on cardinality. Low-cardinality nominal features (gender with 3 values, source_market with 2 values) were one-hot encoded. High-cardinality features (individual_category with 106 values, brand_grouped with 1,371 values) were encoded using target encoding with smoothing. Target encoding replaces each category with the shrunk posterior mean of the target given that category:"
));
children.push(mathFormula([
  new MathRun("encoded(c) = "),
  new MathFraction({
    numerator: [
      new MathSubScript({ children: [new MathRun("n")], subScript: [new MathRun("c")] }),
      new MathRun(" \u00B7 "),
      new MathSubScript({ children: [new MathRun("\u01F7")], subScript: [new MathRun("c")] }),
      new MathRun(" + s \u00B7 \u01F7"),
    ],
    denominator: [
      new MathSubScript({ children: [new MathRun("n")], subScript: [new MathRun("c")] }),
      new MathRun(" + s"),
    ],
  }),
]));
children.push(body(
  "where n_c is the count of samples in category c, \u01F7_c is the mean target within category c, \u01F7 is the global mean, and s = 10 is the smoothing parameter. Higher smoothing pulls estimates toward the global mean for categories with few samples, preventing overfitting on sparse categories."
));

/* ---- 3.2.5 Final Feature Set ---- */
children.push(h3("3.2.5 Final Feature Set"));
children.push(body("The model uses twelve features across three encoding strategies:"));

children.push(bullet("Numeric (passthrough): price_usd, log_price, log_rating_count, title_length, title_word_count, kw_women, kw_men, kw_kids (8 features)."));
children.push(bullet("One-hot encoded: gender (3 values), source_market (2 values) (5 binary columns after encoding)."));
children.push(bullet("Target encoded: individual_category (106 values), brand_grouped (1,371 values) (2 continuous columns after encoding)."));

/* ================================================================== */
/*  3.3 MODEL TRAINING & EVALUATION                                    */
/* ================================================================== */
children.push(new Paragraph({ children: [new PageBreak()] }));
children.push(h2("3.3 Model Training & Evaluation"));

children.push(body(
  "Four classifiers spanning different algorithmic families were trained and compared. Using a diverse set allows the strengths and weaknesses of each paradigm to be empirically assessed rather than relying on a single a priori assumption. Table 3.7 summarises the models; the theoretical basis of each is described in the following subsections."
));

children.push(
  makeTable(
    ["Model", "Family", "Key Characteristics"],
    [
      ["Logistic Regression", "Linear", "Interpretable, fast, assumes linear decision boundary"],
      ["Random Forest", "Ensemble (Bagging)", "Non-linear, robust to outliers, built-in importance"],
      ["XGBoost", "Ensemble (Boosting)", "Gradient-boosted trees, regularised, state-of-the-art tabular performance"],
      ["LightGBM", "Ensemble (Boosting)", "Leaf-wise boosting, faster than XGBoost, comparable accuracy"],
    ],
    [3200, 2600, 4040]
  )
);
children.push(caption("Table 3.7 \u2014 Machine learning models experimented with in this study."));

children.push(workflowDiagram());
children.push(caption("Figure 3.7 \u2014 Overall model training and evaluation workflow."));

/* ---- 3.3.1 Logistic Regression ---- */
children.push(h3("3.3.1 Logistic Regression"));

children.push(body("Logistic Regression estimates the probability of a data point belonging to a given class by passing a linear combination of the input features through the sigmoid function:"));
children.push(mathFormula([
  new MathRun("\u03C3(z) = "),
  new MathFraction({ numerator: [new MathRun("1")], denominator: [
    new MathRun("1 + "),
    new MathSuperScript({ children: [new MathRun("e")], superScript: [new MathRun("\u2212z")] }),
  ] }),
]));
children.push(body("where z = w \u00B7 x + b is the linear combination of input features x with learned weights w and bias b. The predicted class is 1 if \u03C3(z) >= 0.5, and 0 otherwise. Parameters are learned by minimising the binary cross-entropy (log-loss):"));
children.push(mathFormula("J(w, b) = \u2212(1/n) \u00B7 \u03A3_i [ y_i \u00B7 ln(\u0177_i) + (1 \u2212 y_i) \u00B7 ln(1 \u2212 \u0177_i) ]"));

/* ---- 3.3.2 Random Forest ---- */
children.push(h3("3.3.2 Random Forest"));

children.push(body(
  "Random Forest is an ensemble method that builds a large number of decision trees on bootstrap-resampled subsets of the training data, with each tree also restricted to a random subset of features at every split. This decorrelates the trees and substantially reduces variance compared to a single decision tree. The final prediction is obtained by majority vote across all trees:"
));
children.push(mathFormula("\u0177 = mode{ T_1(x), T_2(x), \u2026, T_B(x) }"));
children.push(body("where T_b is the b-th tree in a forest of B trees. The model was trained with 400 trees, a maximum depth of 6, and class-weight balancing to handle the moderate 53/47 class imbalance."));

/* ---- 3.3.3 XGBoost ---- */
children.push(h3("3.3.3 XGBoost"));

children.push(body(
  "XGBoost builds an ensemble of shallow trees sequentially, where each new tree is trained to correct the residual errors of the ensemble built so far by fitting the negative gradient of the loss function. An optimised, regularised implementation of gradient boosting, XGBoost additionally penalises tree complexity to control overfitting:"
));
children.push(mathFormula("Additive model: F_m(x) = F_{m\u22121}(x) + \u03B7 \u00B7 h_m(x)"));
children.push(mathFormula("Objective: Obj = \u03A3 L(y_i, \u0177_i) + \u03A3 \u03A9(f_k),  \u03A9(f) = \u03B3T + (1/2)\u03BB\u2016w\u2016\u00B2"));
children.push(body("where h_m is the m-th weak learner, \u03B7 is the learning rate, \u03B3 and \u03BB are regularisation parameters, and T is the number of leaves. The model was configured with 400 estimators, max depth 8, learning rate 0.05, and colsample_bytree = 0.6."));

/* ---- 3.3.4 LightGBM ---- */
children.push(h3("3.3.4 LightGBM"));

children.push(body(
  "LightGBM is a gradient boosting framework that uses leaf-wise tree growth (expanding the leaf with the highest loss reduction) rather than the level-wise growth used by XGBoost. This can achieve faster convergence and lower memory usage, particularly on large datasets. LightGBM also employs Gradient-based One-Side Sampling (GOSS) to prioritise training instances with larger gradients, and Exclusive Feature Bundling (EFB) to reduce dimensionality. The model was trained with 400 estimators, learning rate 0.05, and 31 leaves."
));

/* ---- 3.3.5 Cross-Validation & Hyperparameter Tuning ---- */
children.push(h3("3.3.5 Cross-Validation and Hyperparameter Tuning"));

children.push(body(
  "To evaluate models without overfitting to the test set, 5-fold stratified cross-validation was used on the training partition. Stratification preserves the 53/47 class distribution in every fold. Each model was wrapped in a Pipeline containing the preprocessing steps (including target encoding, which was refit from scratch inside every fold to prevent cross-contamination of target information)."
));

children.push(body("The cross-validation score is the average ROC-AUC across all five folds:"));
children.push(mathFormula("CV_score = (1/k) \u00B7 \u03A3_i AUC(Model_i, fold_i)"));
children.push(body(
  "Hyperparameter tuning was performed using random search (20 iterations) on the training folds, optimising for ROC-AUC. The search grid for XGBoost included n_estimators {200, 400, 600}, max_depth {4, 6, 8}, learning_rate {0.03, 0.05, 0.1}, subsample {0.7, 0.8, 1.0}, colsample_bytree {0.6, 0.8, 1.0}, and min_child_weight {1, 3, 5}. The same grid structure was adapted for LightGBM and Random Forest."
));

/* ---- 3.3.6 Model Evaluation Metrics ---- */
children.push(h3("3.3.6 Model Evaluation Metrics"));

children.push(body(
  "Models were assessed using standard binary classification metrics defined in terms of true positives (TP), true negatives (TN), false positives (FP), and false negatives (FN):"
));

children.push(mathFormula([
  new MathRun("Precision = "),
  new MathFraction({ numerator: [new MathRun("TP")], denominator: [new MathRun("TP + FP")] }),
]));
children.push(mathFormula([
  new MathRun("Recall = "),
  new MathFraction({ numerator: [new MathRun("TP")], denominator: [new MathRun("TP + FN")] }),
]));
children.push(mathFormula([
  new MathRun("F1 = 2 \u00B7 "),
  new MathFraction({
    numerator: [new MathRun("Precision \u00B7 Recall")],
    denominator: [new MathRun("Precision + Recall")],
  }),
]));
children.push(mathFormula([
  new MathRun("Accuracy = "),
  new MathFraction({
    numerator: [new MathRun("TP + TN")],
    denominator: [new MathRun("TP + TN + FP + FN")],
  }),
]));
children.push(body(
  "ROC-AUC was used as the primary optimisation metric because it measures the model's ability to rank positive instances higher than negative ones, independent of any classification threshold. F1-score and accuracy were tracked as secondary metrics."
));

/* ---- 3.3.7 Model Selection Results ---- */
children.push(h3("3.3.7 Model Selection Results"));

children.push(body(
  "The four models were compared via 5-fold cross-validation on the training set. A fixed random seed (42) was used across all operations including train/test split, CV folds, model initialisation, and permutation shuffling, ensuring full reproducibility."
));

children.push(
  makeTable(
    ["Model", "CV ROC-AUC", "F1", "Accuracy"],
    [
      ["Logistic Regression", "0.6832", "0.6581", "0.6342"],
      ["Random Forest", "0.7058", "0.6756", "0.6487"],
      ["XGBoost", "0.7059", "0.6865", "0.6491"],
      ["LightGBM", "0.7048", "0.6870", "0.6490"],
    ],
    [3200, 2300, 2300, 2300]
  )
);
children.push(caption("Table 3.8 \u2014 Cross-validation performance comparison across the four candidate models."));

children.push(body(
  "Tree-based models (Random Forest, XGBoost, LightGBM) cluster tightly at AUC ~0.705\u20130.706, significantly outperforming Logistic Regression (~0.683). This confirms the presence of non-linear feature interactions that a linear decision boundary cannot capture. XGBoost was selected as the best model, edging out on ROC-AUC by a narrow margin (0.7059 vs. 0.7058 for Random Forest). All models exhibited very low cross-validation variance (<0.004 SD), indicating stable and reproducible performance."
));

children.push(insertFigure("graphs/07_model_comparison_realistic.png", 700, 420));
children.push(caption("Figure 3.8 \u2014 Cross-validation ROC-AUC comparison across the four candidate models."));

/* ---- 3.3.8 Feature Importance Analysis ---- */
children.push(h3("3.3.8 Feature Importance Analysis"));

children.push(body(
  "Two complementary techniques were used to understand feature contributions after model selection. The first, model-native feature importance from XGBoost, measures how often each feature was used for splitting weighted by the improvement it brought. The second, permutation importance, measures the drop in ROC-AUC when a single feature's values are randomly shuffled, breaking its association with the target. Permutation importance is model-agnostic and does not rely on internal tree structure."
));

children.push(body(
  "Permutation importance was computed with 5 repetitions per feature. The top three features by importance were brand_grouped (\u0394AUC = 0.169), individual_category (\u0394AUC = 0.076), and log_rating_count (\u0394AUC = 0.052). Together these three features account for approximately 30% of the model's discriminative power. Price and title-length features contributed modestly (3\u20135% combined), while the title keyword flags contributed negligibly (<1%), indicating that the structured gender column already captures this information."
));

children.push(insertFigure("graphs/13_permutation_importance_realistic.png", 700, 500));
children.push(caption("Figure 3.9 \u2014 Permutation importance ranking (drop in ROC-AUC when each feature is shuffled)."));

/* ---- 3.3.9 Limitations & Ceiling Estimate ---- */
children.push(h3("3.3.9 Limitations and Ceiling Estimate"));

children.push(body(
  "The honest and important methodological conclusion is that predicting whether a product will receive good reviews from listing metadata alone is fundamentally difficult. The features available at listing time describe what the product is (brand, category, price, gender), not how good it is. Product quality \u2014 the primary driver of ratings and thus trending status \u2014 is not captured in listing metadata."
));

children.push(body(
  "The selected XGBoost model achieves a cross-validation ROC-AUC of ~0.706 and a test-set AUC of ~0.719. This is a realistic and informative result, not a model deficiency. Based on the available feature set and the inherent unpredictability of consumer ratings, the estimated upper bound for metadata-only prediction is AUC 0.75\u20130.80. A test-set ROC-AUC of 0.719 means the model sits close to this ceiling. The model is suitable for use as a screening or routing tool \u2014 not as an autonomous decision-maker \u2014 and is particularly appropriate for applications where missing a trending product (false negative) is more costly than a false alarm, given its recall-heavy profile (73% recall, 66% precision on the test set)."
));

/* ------------------------------------------------------------------ */
/*  BUILD DOCUMENT                                                    */
/* ------------------------------------------------------------------ */

const doc = new Document({
  styles: {
    default: {
      document: {
        run: { font: FONT, size: BODY_SIZE },
      },
    },
  },
  numbering: {
    config: [
      {
        reference: "bullet-list",
        levels: [
          {
            level: 0,
            format: LevelFormat.BULLET,
            text: "\u2022",
            alignment: AlignmentType.LEFT,
            style: {
              paragraph: {
                indent: { left: 720, hanging: 360 },
              },
            },
          },
        ],
      },
    ],
  },
  sections: [
    {
      properties: {
        page: {
          size: { width: PAGE_WIDTH, height: PAGE_HEIGHT },
          margin: {
            top: MARGIN_TB,
            bottom: MARGIN_TB,
            left: MARGIN_LR,
            right: MARGIN_LR,
          },
        },
      },
      children,
    },
  ],
});

Packer.toBuffer(doc).then((buffer) => {
  const outPath = "Methodology.docx";
  fs.writeFileSync(outPath, buffer);
  console.log(outPath + " generated successfully (" + (buffer.length / 1024).toFixed(0) + " KB).");
});
