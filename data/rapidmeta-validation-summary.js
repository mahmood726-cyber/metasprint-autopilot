(function(){
  'use strict';
  window.RM_TOPIC_VALIDATION_SUMMARY = {
  "timestamp_utc": "2026-03-15T11:49:19.390615+00:00",
  "summary": {
    "total_topics": 70,
    "status_counts": {
      "pass": 6,
      "warn": 61,
      "fail": 3
    },
    "policy_pass_topics": 70,
    "search_nonzero_topics": {
      "ctgov": 70,
      "pubmed": 70,
      "openalex": 70
    },
    "anchor_recall_mean": {
      "ctgov": 0.2258,
      "pubmed": 0.5348,
      "openalex": 0.5899
    },
    "extraction_success": {
      "ctgov_success_topics": 14,
      "pubmed_success_topics": 67
    },
    "comparator_topics": {
      "backed_topics": 63,
      "exact_topics": 23,
      "exact_topics_with_passed_pack": 23,
      "domain_topics": 40,
      "queued_topics": 7
    }
  },
  "topics": [
    {
      "category": "Heart Failure",
      "extraction": {
        "ctgov": {
          "has2x2": false,
          "hasReportedEffect": true,
          "hasResults": true,
          "matchScore": 98,
          "matchedOutcome": "Number of Total Occurrences of Cardiovascular (CV) Death, Hospitalizations for Heart Failure (HHF) and Urgent Visits for Heart Failure (HF)",
          "recordExtract": "Number of Total Occurrences of Cardiovascular (CV) Death, Hospitalizations for Heart Failure (HHF) and Urgent Visits for Heart Failure (HF) | Tx --/-- vs Ctrl --/--",
          "sampleNctId": "NCT03521934",
          "success": true
        },
        "pubmed": {
          "effectCount": 3,
          "firstExtract": "RR: 0.80, 95% CI 0.69-0.93",
          "pmid": "41789221",
          "success": true,
          "title": "A network meta-analysis of safety and efficacy of sodium-glucose cotransporter 2 inhibitors in heart failure patients."
        }
      },
      "failReasons": [],
      "name": "SGLT2 inhibitors - Heart Failure - Composite",
      "policy": {
        "allowedSources": [
          "ctgov",
          "pubmed",
          "openalex"
        ],
        "extractionMode": "pubmed-abstract-and-ctgov-records-only",
        "pass": true,
        "pdfUploadHidden": true,
        "pdfViewerHidden": true,
        "yearFloor": 2015
      },
      "screening": {
        "humanCheckable": true,
        "recordsWithAnchors": 1
      },
      "search": {
        "ctgov": {
          "anchorRecall": 0.2,
          "count": 20,
          "eligible": 5,
          "firstResult": {
            "nctId": "NCT06578078",
            "title": "A Randomized Clinical Trial to Define the Best Strategy for the Management of Heart Failure and Chronic Kidney Disease Among Elderly Patients With or at High Risk of hyperKalemia in Span by Optimizing the Use of RAASi With SZC",
            "year": "2024"
          },
          "matched": [
            "NCT03036124"
          ],
          "statusText": "CT.gov: kept 20 trials after applying the 2015+ floor"
        },
        "openalex": {
          "anchorRecall": 0.4,
          "count": 20,
          "eligible": 5,
          "firstResult": {
            "doi": "10.1038/s41591-021-01659-1",
            "pmid": "35228754",
            "title": "The SGLT2 inhibitor empagliflozin in patients hospitalized for acute heart failure: a multinational randomized trial",
            "year": "2022"
          },
          "matched": [
            "NCT03036124",
            "NCT03057977"
          ],
          "statusText": "OpenAlex: kept 20 records after applying the 2015+ floor"
        },
        "pubmed": {
          "anchorRecall": 0.8,
          "count": 20,
          "eligible": 5,
          "firstResult": {
            "doi": "10.1016/j.jtcvs.2026.02.037",
            "pmid": "41831709",
            "title": "Sodium-glucose cotransporter 2 inhibitor use and outcomes after surgical aortic valve replacement.",
            "year": "2026"
          },
          "matched": [
            "NCT03036124",
            "NCT03057977",
            "NCT03057951",
            "NCT03619213"
          ],
          "statusText": "40 total results (PubMed: 20)"
        }
      },
      "status": "pass",
      "topicId": "sglt2i_hf_composite",
      "validationPackId": "sglt2i_hf_benchmark",
      "id": "sglt2i_hf_composite",
      "pack": {
        "id": "sglt2i_hf_benchmark",
        "meta": {
          "date": "2026-03-13",
          "id": "sglt2i_hf_benchmark",
          "name": "SGLT2 HF/CKD Golden Benchmark",
          "reference": {
            "journal": "Lancet",
            "title": "Vaduganathan et al. SGLT2 inhibitors in heart failure and kidney disease",
            "year": 2022
          },
          "summary": "Bundled golden HF and CKD benchmark outcomes aligned to Vaduganathan 2022 Lancet and CRES v5.0.",
          "tier": "exact",
          "verdict": "PASS"
        },
        "report_summary": null
      }
    },
    {
      "category": "Heart Failure",
      "extraction": {
        "ctgov": {
          "has2x2": false,
          "hasReportedEffect": true,
          "hasResults": true,
          "matchScore": 98,
          "matchedOutcome": "Number of Total Occurrences of Cardiovascular (CV) Death, Hospitalizations for Heart Failure (HHF) and Urgent Visits for Heart Failure (HF)",
          "recordExtract": "Number of Total Occurrences of Cardiovascular (CV) Death, Hospitalizations for Heart Failure (HHF) and Urgent Visits for Heart Failure (HF) | Tx --/-- vs Ctrl --/--",
          "sampleNctId": "NCT03521934",
          "success": true
        },
        "pubmed": {
          "effectCount": 3,
          "firstExtract": "RR: 0.80, 95% CI 0.69-0.93",
          "pmid": "41789221",
          "success": true,
          "title": "A network meta-analysis of safety and efficacy of sodium-glucose cotransporter 2 inhibitors in heart failure patients."
        }
      },
      "failReasons": [],
      "name": "SGLT2 inhibitors - Heart Failure - HF hospitalization",
      "policy": {
        "allowedSources": [
          "ctgov",
          "pubmed",
          "openalex"
        ],
        "extractionMode": "pubmed-abstract-and-ctgov-records-only",
        "pass": true,
        "pdfUploadHidden": true,
        "pdfViewerHidden": true,
        "yearFloor": 2015
      },
      "screening": {
        "humanCheckable": true,
        "recordsWithAnchors": 1
      },
      "search": {
        "ctgov": {
          "anchorRecall": 0.2,
          "count": 20,
          "eligible": 5,
          "firstResult": {
            "nctId": "NCT06578078",
            "title": "A Randomized Clinical Trial to Define the Best Strategy for the Management of Heart Failure and Chronic Kidney Disease Among Elderly Patients With or at High Risk of hyperKalemia in Span by Optimizing the Use of RAASi With SZC",
            "year": "2024"
          },
          "matched": [
            "NCT03036124"
          ],
          "statusText": "CT.gov: kept 20 trials after applying the 2015+ floor"
        },
        "openalex": {
          "anchorRecall": 0.4,
          "count": 20,
          "eligible": 5,
          "firstResult": {
            "doi": "10.1038/s41591-021-01659-1",
            "pmid": "35228754",
            "title": "The SGLT2 inhibitor empagliflozin in patients hospitalized for acute heart failure: a multinational randomized trial",
            "year": "2022"
          },
          "matched": [
            "NCT03036124",
            "NCT03057977"
          ],
          "statusText": "OpenAlex: kept 20 records after applying the 2015+ floor"
        },
        "pubmed": {
          "anchorRecall": 0.8,
          "count": 20,
          "eligible": 5,
          "firstResult": {
            "doi": "10.1016/j.jtcvs.2026.02.037",
            "pmid": "41831709",
            "title": "Sodium-glucose cotransporter 2 inhibitor use and outcomes after surgical aortic valve replacement.",
            "year": "2026"
          },
          "matched": [
            "NCT03036124",
            "NCT03057977",
            "NCT03057951",
            "NCT03619213"
          ],
          "statusText": "100 total results (PubMed: 20)"
        }
      },
      "status": "pass",
      "topicId": "sglt2i_hf_hfh",
      "validationPackId": "sglt2i_hf_benchmark",
      "id": "sglt2i_hf_hfh",
      "pack": {
        "id": "sglt2i_hf_benchmark",
        "meta": {
          "date": "2026-03-13",
          "id": "sglt2i_hf_benchmark",
          "name": "SGLT2 HF/CKD Golden Benchmark",
          "reference": {
            "journal": "Lancet",
            "title": "Vaduganathan et al. SGLT2 inhibitors in heart failure and kidney disease",
            "year": 2022
          },
          "summary": "Bundled golden HF and CKD benchmark outcomes aligned to Vaduganathan 2022 Lancet and CRES v5.0.",
          "tier": "exact",
          "verdict": "PASS"
        },
        "report_summary": null
      }
    },
    {
      "category": "Heart Failure",
      "extraction": {
        "ctgov": {
          "has2x2": false,
          "hasReportedEffect": true,
          "hasResults": true,
          "matchScore": 75,
          "matchedOutcome": "Number of Total Occurrences of Cardiovascular (CV) Death, Hospitalizations for Heart Failure (HHF) and Urgent Visits for Heart Failure (HF)",
          "recordExtract": "Number of Total Occurrences of Cardiovascular (CV) Death, Hospitalizations for Heart Failure (HHF) and Urgent Visits for Heart Failure (HF) | Tx --/-- vs Ctrl --/--",
          "sampleNctId": "NCT03521934",
          "success": true
        },
        "pubmed": {
          "effectCount": 3,
          "firstExtract": "RR: 0.80, 95% CI 0.69-0.93",
          "pmid": "41789221",
          "success": true,
          "title": "A network meta-analysis of safety and efficacy of sodium-glucose cotransporter 2 inhibitors in heart failure patients."
        }
      },
      "failReasons": [],
      "name": "SGLT2 inhibitors - Heart Failure - CV death",
      "policy": {
        "allowedSources": [
          "ctgov",
          "pubmed",
          "openalex"
        ],
        "extractionMode": "pubmed-abstract-and-ctgov-records-only",
        "pass": true,
        "pdfUploadHidden": true,
        "pdfViewerHidden": true,
        "yearFloor": 2015
      },
      "screening": {
        "humanCheckable": true,
        "recordsWithAnchors": 1
      },
      "search": {
        "ctgov": {
          "anchorRecall": 0.2,
          "count": 20,
          "eligible": 5,
          "firstResult": {
            "nctId": "NCT06578078",
            "title": "A Randomized Clinical Trial to Define the Best Strategy for the Management of Heart Failure and Chronic Kidney Disease Among Elderly Patients With or at High Risk of hyperKalemia in Span by Optimizing the Use of RAASi With SZC",
            "year": "2024"
          },
          "matched": [
            "NCT03036124"
          ],
          "statusText": "CT.gov: kept 20 trials after applying the 2015+ floor"
        },
        "openalex": {
          "anchorRecall": 0.4,
          "count": 20,
          "eligible": 5,
          "firstResult": {
            "doi": "10.1038/s41591-021-01659-1",
            "pmid": "35228754",
            "title": "The SGLT2 inhibitor empagliflozin in patients hospitalized for acute heart failure: a multinational randomized trial",
            "year": "2022"
          },
          "matched": [
            "NCT03036124",
            "NCT03057977"
          ],
          "statusText": "OpenAlex: kept 20 records after applying the 2015+ floor"
        },
        "pubmed": {
          "anchorRecall": 0.8,
          "count": 20,
          "eligible": 5,
          "firstResult": {
            "doi": "10.1016/j.jtcvs.2026.02.037",
            "pmid": "41831709",
            "title": "Sodium-glucose cotransporter 2 inhibitor use and outcomes after surgical aortic valve replacement.",
            "year": "2026"
          },
          "matched": [
            "NCT03036124",
            "NCT03057977",
            "NCT03057951",
            "NCT03619213"
          ],
          "statusText": "160 total results (PubMed: 20)"
        }
      },
      "status": "pass",
      "topicId": "sglt2i_hf_cvdeath",
      "validationPackId": "sglt2i_hf_benchmark",
      "id": "sglt2i_hf_cvdeath",
      "pack": {
        "id": "sglt2i_hf_benchmark",
        "meta": {
          "date": "2026-03-13",
          "id": "sglt2i_hf_benchmark",
          "name": "SGLT2 HF/CKD Golden Benchmark",
          "reference": {
            "journal": "Lancet",
            "title": "Vaduganathan et al. SGLT2 inhibitors in heart failure and kidney disease",
            "year": 2022
          },
          "summary": "Bundled golden HF and CKD benchmark outcomes aligned to Vaduganathan 2022 Lancet and CRES v5.0.",
          "tier": "exact",
          "verdict": "PASS"
        },
        "report_summary": null
      }
    },
    {
      "category": "Heart Failure",
      "extraction": {
        "ctgov": {
          "has2x2": false,
          "hasReportedEffect": true,
          "hasResults": true,
          "matchScore": 33,
          "matchedOutcome": "Number of Total Occurrences of Cardiovascular (CV) Death, Hospitalizations for Heart Failure (HHF) and Urgent Visits for Heart Failure (HF)",
          "recordExtract": "Number of Total Occurrences of Cardiovascular (CV) Death, Hospitalizations for Heart Failure (HHF) and Urgent Visits for Heart Failure (HF) | Tx --/-- vs Ctrl --/--",
          "sampleNctId": "NCT03521934",
          "success": true
        },
        "pubmed": {
          "effectCount": 3,
          "firstExtract": "RR: 0.80, 95% CI 0.69-0.93",
          "pmid": "41789221",
          "success": true,
          "title": "A network meta-analysis of safety and efficacy of sodium-glucose cotransporter 2 inhibitors in heart failure patients."
        }
      },
      "failReasons": [],
      "name": "SGLT2 inhibitors - Heart Failure - All-cause mortality",
      "policy": {
        "allowedSources": [
          "ctgov",
          "pubmed",
          "openalex"
        ],
        "extractionMode": "pubmed-abstract-and-ctgov-records-only",
        "pass": true,
        "pdfUploadHidden": true,
        "pdfViewerHidden": true,
        "yearFloor": 2015
      },
      "screening": {
        "humanCheckable": true,
        "recordsWithAnchors": 1
      },
      "search": {
        "ctgov": {
          "anchorRecall": 0.2,
          "count": 20,
          "eligible": 5,
          "firstResult": {
            "nctId": "NCT06578078",
            "title": "A Randomized Clinical Trial to Define the Best Strategy for the Management of Heart Failure and Chronic Kidney Disease Among Elderly Patients With or at High Risk of hyperKalemia in Span by Optimizing the Use of RAASi With SZC",
            "year": "2024"
          },
          "matched": [
            "NCT03036124"
          ],
          "statusText": "CT.gov: kept 20 trials after applying the 2015+ floor"
        },
        "openalex": {
          "anchorRecall": 0.4,
          "count": 20,
          "eligible": 5,
          "firstResult": {
            "doi": "10.1038/s41591-021-01659-1",
            "pmid": "35228754",
            "title": "The SGLT2 inhibitor empagliflozin in patients hospitalized for acute heart failure: a multinational randomized trial",
            "year": "2022"
          },
          "matched": [
            "NCT03036124",
            "NCT03057977"
          ],
          "statusText": "OpenAlex: kept 20 records after applying the 2015+ floor"
        },
        "pubmed": {
          "anchorRecall": 0.8,
          "count": 20,
          "eligible": 5,
          "firstResult": {
            "doi": "10.1016/j.jtcvs.2026.02.037",
            "pmid": "41831709",
            "title": "Sodium-glucose cotransporter 2 inhibitor use and outcomes after surgical aortic valve replacement.",
            "year": "2026"
          },
          "matched": [
            "NCT03036124",
            "NCT03057977",
            "NCT03057951",
            "NCT03619213"
          ],
          "statusText": "220 total results (PubMed: 20)"
        }
      },
      "status": "pass",
      "topicId": "sglt2i_hf_allcause",
      "validationPackId": "sglt2i_hf_benchmark",
      "id": "sglt2i_hf_allcause",
      "pack": {
        "id": "sglt2i_hf_benchmark",
        "meta": {
          "date": "2026-03-13",
          "id": "sglt2i_hf_benchmark",
          "name": "SGLT2 HF/CKD Golden Benchmark",
          "reference": {
            "journal": "Lancet",
            "title": "Vaduganathan et al. SGLT2 inhibitors in heart failure and kidney disease",
            "year": 2022
          },
          "summary": "Bundled golden HF and CKD benchmark outcomes aligned to Vaduganathan 2022 Lancet and CRES v5.0.",
          "tier": "exact",
          "verdict": "PASS"
        },
        "report_summary": null
      }
    },
    {
      "category": "Heart Failure",
      "extraction": {
        "ctgov": {
          "has2x2": false,
          "hasReportedEffect": true,
          "hasResults": true,
          "matchScore": 15,
          "matchedOutcome": "Number of Total Occurrences of Cardiovascular (CV) Death, Hospitalizations for Heart Failure (HHF) and Urgent Visits for Heart Failure (HF)",
          "recordExtract": "Number of Total Occurrences of Cardiovascular (CV) Death, Hospitalizations for Heart Failure (HHF) and Urgent Visits for Heart Failure (HF) | Tx --/-- vs Ctrl --/--",
          "sampleNctId": "NCT03521934",
          "success": true
        },
        "pubmed": {
          "effectCount": 3,
          "firstExtract": "RR: 0.80, 95% CI 0.69-0.93",
          "pmid": "41789221",
          "success": true,
          "title": "A network meta-analysis of safety and efficacy of sodium-glucose cotransporter 2 inhibitors in heart failure patients."
        }
      },
      "failReasons": [],
      "name": "SGLT2 inhibitors - Heart Failure - HFrEF subgroup",
      "policy": {
        "allowedSources": [
          "ctgov",
          "pubmed",
          "openalex"
        ],
        "extractionMode": "pubmed-abstract-and-ctgov-records-only",
        "pass": true,
        "pdfUploadHidden": true,
        "pdfViewerHidden": true,
        "yearFloor": 2015
      },
      "screening": {
        "humanCheckable": true,
        "recordsWithAnchors": 1
      },
      "search": {
        "ctgov": {
          "anchorRecall": 0.2,
          "count": 20,
          "eligible": 5,
          "firstResult": {
            "nctId": "NCT06578078",
            "title": "A Randomized Clinical Trial to Define the Best Strategy for the Management of Heart Failure and Chronic Kidney Disease Among Elderly Patients With or at High Risk of hyperKalemia in Span by Optimizing the Use of RAASi With SZC",
            "year": "2024"
          },
          "matched": [
            "NCT03036124"
          ],
          "statusText": "CT.gov: kept 20 trials after applying the 2015+ floor"
        },
        "openalex": {
          "anchorRecall": 0.4,
          "count": 20,
          "eligible": 5,
          "firstResult": {
            "doi": "10.1038/s41591-021-01659-1",
            "pmid": "35228754",
            "title": "The SGLT2 inhibitor empagliflozin in patients hospitalized for acute heart failure: a multinational randomized trial",
            "year": "2022"
          },
          "matched": [
            "NCT03036124",
            "NCT03057977"
          ],
          "statusText": "OpenAlex: kept 20 records after applying the 2015+ floor"
        },
        "pubmed": {
          "anchorRecall": 0.8,
          "count": 20,
          "eligible": 5,
          "firstResult": {
            "doi": "10.1016/j.jtcvs.2026.02.037",
            "pmid": "41831709",
            "title": "Sodium-glucose cotransporter 2 inhibitor use and outcomes after surgical aortic valve replacement.",
            "year": "2026"
          },
          "matched": [
            "NCT03036124",
            "NCT03057977",
            "NCT03057951",
            "NCT03619213"
          ],
          "statusText": "280 total results (PubMed: 20)"
        }
      },
      "status": "pass",
      "topicId": "sglt2i_hf_hfref",
      "validationPackId": "sglt2i_hf_benchmark",
      "id": "sglt2i_hf_hfref",
      "pack": {
        "id": "sglt2i_hf_benchmark",
        "meta": {
          "date": "2026-03-13",
          "id": "sglt2i_hf_benchmark",
          "name": "SGLT2 HF/CKD Golden Benchmark",
          "reference": {
            "journal": "Lancet",
            "title": "Vaduganathan et al. SGLT2 inhibitors in heart failure and kidney disease",
            "year": 2022
          },
          "summary": "Bundled golden HF and CKD benchmark outcomes aligned to Vaduganathan 2022 Lancet and CRES v5.0.",
          "tier": "exact",
          "verdict": "PASS"
        },
        "report_summary": null
      }
    },
    {
      "category": "Heart Failure",
      "extraction": {
        "ctgov": {
          "has2x2": false,
          "hasReportedEffect": true,
          "hasResults": true,
          "matchScore": 15,
          "matchedOutcome": "Number of Total Occurrences of Cardiovascular (CV) Death, Hospitalizations for Heart Failure (HHF) and Urgent Visits for Heart Failure (HF)",
          "recordExtract": "Number of Total Occurrences of Cardiovascular (CV) Death, Hospitalizations for Heart Failure (HHF) and Urgent Visits for Heart Failure (HF) | Tx --/-- vs Ctrl --/--",
          "sampleNctId": "NCT03521934",
          "success": true
        },
        "pubmed": {
          "effectCount": 3,
          "firstExtract": "RR: 0.80, 95% CI 0.69-0.93",
          "pmid": "41789221",
          "success": true,
          "title": "A network meta-analysis of safety and efficacy of sodium-glucose cotransporter 2 inhibitors in heart failure patients."
        }
      },
      "failReasons": [],
      "name": "SGLT2 inhibitors - Heart Failure - HFpEF subgroup",
      "policy": {
        "allowedSources": [
          "ctgov",
          "pubmed",
          "openalex"
        ],
        "extractionMode": "pubmed-abstract-and-ctgov-records-only",
        "pass": true,
        "pdfUploadHidden": true,
        "pdfViewerHidden": true,
        "yearFloor": 2015
      },
      "screening": {
        "humanCheckable": true,
        "recordsWithAnchors": 1
      },
      "search": {
        "ctgov": {
          "anchorRecall": 0.2,
          "count": 20,
          "eligible": 5,
          "firstResult": {
            "nctId": "NCT06578078",
            "title": "A Randomized Clinical Trial to Define the Best Strategy for the Management of Heart Failure and Chronic Kidney Disease Among Elderly Patients With or at High Risk of hyperKalemia in Span by Optimizing the Use of RAASi With SZC",
            "year": "2024"
          },
          "matched": [
            "NCT03036124"
          ],
          "statusText": "CT.gov: kept 20 trials after applying the 2015+ floor"
        },
        "openalex": {
          "anchorRecall": 0.4,
          "count": 20,
          "eligible": 5,
          "firstResult": {
            "doi": "10.1038/s41591-021-01659-1",
            "pmid": "35228754",
            "title": "The SGLT2 inhibitor empagliflozin in patients hospitalized for acute heart failure: a multinational randomized trial",
            "year": "2022"
          },
          "matched": [
            "NCT03036124",
            "NCT03057977"
          ],
          "statusText": "OpenAlex: kept 20 records after applying the 2015+ floor"
        },
        "pubmed": {
          "anchorRecall": 0.8,
          "count": 20,
          "eligible": 5,
          "firstResult": {
            "doi": "10.1016/j.jtcvs.2026.02.037",
            "pmid": "41831709",
            "title": "Sodium-glucose cotransporter 2 inhibitor use and outcomes after surgical aortic valve replacement.",
            "year": "2026"
          },
          "matched": [
            "NCT03036124",
            "NCT03057977",
            "NCT03057951",
            "NCT03619213"
          ],
          "statusText": "340 total results (PubMed: 20)"
        }
      },
      "status": "pass",
      "topicId": "sglt2i_hf_hfpef",
      "validationPackId": "sglt2i_hf_benchmark",
      "id": "sglt2i_hf_hfpef",
      "pack": {
        "id": "sglt2i_hf_benchmark",
        "meta": {
          "date": "2026-03-13",
          "id": "sglt2i_hf_benchmark",
          "name": "SGLT2 HF/CKD Golden Benchmark",
          "reference": {
            "journal": "Lancet",
            "title": "Vaduganathan et al. SGLT2 inhibitors in heart failure and kidney disease",
            "year": 2022
          },
          "summary": "Bundled golden HF and CKD benchmark outcomes aligned to Vaduganathan 2022 Lancet and CRES v5.0.",
          "tier": "exact",
          "verdict": "PASS"
        },
        "report_summary": null
      }
    },
    {
      "category": "Kidney Disease",
      "extraction": {
        "ctgov": {
          "has2x2": false,
          "hasReportedEffect": true,
          "hasResults": true,
          "matchScore": 97,
          "matchedOutcome": "Primary Composite Endpoint of Doubling of Serum Creatinine (DoSC), End-stage Kidney Disease (ESKD), and Renal or Cardiovascular (CV) Death",
          "recordExtract": "Primary Composite Endpoint of Doubling of Serum Creatinine (DoSC), End-stage Kidney Disease (ESKD), and Renal or Cardiovascular (CV) Death | Tx --/-- vs Ctrl --/--",
          "sampleNctId": "NCT02065791",
          "success": true
        },
        "pubmed": {
          "effectCount": 2,
          "firstExtract": "HR 10.68; 95%CI: 8.50-13.41",
          "pmid": "41765341",
          "success": true,
          "title": "SGLT2 inhibition in Patients with Type 2 Diabetes and CKD Experiencing a Deterioration in Estimated Glomerular Filtration Rate to <20ml/min/1.73m2."
        }
      },
      "failReasons": [
        "ctgov_anchor_recall"
      ],
      "name": "SGLT2 inhibitors - Chronic Kidney Disease - Renal composite",
      "policy": {
        "allowedSources": [
          "ctgov",
          "pubmed",
          "openalex"
        ],
        "extractionMode": "pubmed-abstract-and-ctgov-records-only",
        "pass": true,
        "pdfUploadHidden": true,
        "pdfViewerHidden": true,
        "yearFloor": 2015
      },
      "screening": {
        "humanCheckable": true,
        "recordsWithAnchors": 0
      },
      "search": {
        "ctgov": {
          "anchorRecall": 0,
          "count": 19,
          "eligible": 3,
          "firstResult": {
            "nctId": "NCT06578078",
            "title": "A Randomized Clinical Trial to Define the Best Strategy for the Management of Heart Failure and Chronic Kidney Disease Among Elderly Patients With or at High Risk of hyperKalemia in Span by Optimizing the Use of RAASi With SZC",
            "year": "2024"
          },
          "matched": [],
          "statusText": "CT.gov: kept 19 trials after applying the 2015+ floor"
        },
        "openalex": {
          "anchorRecall": 0.6666666666666666,
          "count": 20,
          "eligible": 3,
          "firstResult": {
            "doi": "10.1136/bmjdrc-2021-002484",
            "nctId": "NCT01986881",
            "pmid": "34620621",
            "title": "Glycemic efficacy and safety of the SGLT2 inhibitor ertugliflozin in patients with type 2 diabetes and stage 3 chronic kidney disease: an analysis from the VERTIS CV randomized trial",
            "year": "2021"
          },
          "matched": [
            "NCT03036150",
            "NCT02065791"
          ],
          "statusText": "OpenAlex: kept 20 records after applying the 2015+ floor"
        },
        "pubmed": {
          "anchorRecall": 1,
          "count": 20,
          "eligible": 3,
          "firstResult": {
            "doi": "10.1016/j.cardfail.2026.01.025",
            "nctId": "NCT05084235",
            "pmid": "41831639",
            "title": "The effect of empagliflozin on left ventricular mass and volumes in elderly individuals with overweight and high risk of heart failure: The Empire Prevent Cardiac Trial.",
            "year": "2026"
          },
          "matched": [
            "NCT03036150",
            "NCT02065791",
            "NCT03594110"
          ],
          "statusText": "399 total results (PubMed: 20)"
        }
      },
      "status": "warn",
      "topicId": "sglt2i_ckd_renal",
      "validationPackId": "sglt2i_hf_benchmark",
      "id": "sglt2i_ckd_renal",
      "pack": {
        "id": "sglt2i_hf_benchmark",
        "meta": {
          "date": "2026-03-13",
          "id": "sglt2i_hf_benchmark",
          "name": "SGLT2 HF/CKD Golden Benchmark",
          "reference": {
            "journal": "Lancet",
            "title": "Vaduganathan et al. SGLT2 inhibitors in heart failure and kidney disease",
            "year": 2022
          },
          "summary": "Bundled golden HF and CKD benchmark outcomes aligned to Vaduganathan 2022 Lancet and CRES v5.0.",
          "tier": "exact",
          "verdict": "PASS"
        },
        "report_summary": null
      }
    },
    {
      "category": "Kidney Disease",
      "extraction": {
        "ctgov": {
          "has2x2": false,
          "hasReportedEffect": true,
          "hasResults": true,
          "matchScore": 98,
          "matchedOutcome": "Composite Endpoint of CV Death and Hospitalized Heart Failure (HHF)",
          "recordExtract": "Composite Endpoint of CV Death and Hospitalized Heart Failure (HHF) | Tx --/-- vs Ctrl --/--",
          "sampleNctId": "NCT02065791",
          "success": true
        },
        "pubmed": {
          "effectCount": 2,
          "firstExtract": "HR 10.68; 95%CI: 8.50-13.41",
          "pmid": "41765341",
          "success": true,
          "title": "SGLT2 inhibition in Patients with Type 2 Diabetes and CKD Experiencing a Deterioration in Estimated Glomerular Filtration Rate to <20ml/min/1.73m2."
        }
      },
      "failReasons": [
        "ctgov_anchor_recall"
      ],
      "name": "SGLT2 inhibitors - Chronic Kidney Disease - Cardiorenal composite",
      "policy": {
        "allowedSources": [
          "ctgov",
          "pubmed",
          "openalex"
        ],
        "extractionMode": "pubmed-abstract-and-ctgov-records-only",
        "pass": true,
        "pdfUploadHidden": true,
        "pdfViewerHidden": true,
        "yearFloor": 2015
      },
      "screening": {
        "humanCheckable": true,
        "recordsWithAnchors": 0
      },
      "search": {
        "ctgov": {
          "anchorRecall": 0,
          "count": 19,
          "eligible": 3,
          "firstResult": {
            "nctId": "NCT06578078",
            "title": "A Randomized Clinical Trial to Define the Best Strategy for the Management of Heart Failure and Chronic Kidney Disease Among Elderly Patients With or at High Risk of hyperKalemia in Span by Optimizing the Use of RAASi With SZC",
            "year": "2024"
          },
          "matched": [],
          "statusText": "CT.gov: kept 19 trials after applying the 2015+ floor"
        },
        "openalex": {
          "anchorRecall": 0.6666666666666666,
          "count": 20,
          "eligible": 3,
          "firstResult": {
            "doi": "10.1136/bmjdrc-2021-002484",
            "nctId": "NCT01986881",
            "pmid": "34620621",
            "title": "Glycemic efficacy and safety of the SGLT2 inhibitor ertugliflozin in patients with type 2 diabetes and stage 3 chronic kidney disease: an analysis from the VERTIS CV randomized trial",
            "year": "2021"
          },
          "matched": [
            "NCT03036150",
            "NCT02065791"
          ],
          "statusText": "OpenAlex: kept 20 records after applying the 2015+ floor"
        },
        "pubmed": {
          "anchorRecall": 1,
          "count": 20,
          "eligible": 3,
          "firstResult": {
            "doi": "10.1016/j.cardfail.2026.01.025",
            "nctId": "NCT05084235",
            "pmid": "41831639",
            "title": "The effect of empagliflozin on left ventricular mass and volumes in elderly individuals with overweight and high risk of heart failure: The Empire Prevent Cardiac Trial.",
            "year": "2026"
          },
          "matched": [
            "NCT03036150",
            "NCT02065791",
            "NCT03594110"
          ],
          "statusText": "458 total results (PubMed: 20)"
        }
      },
      "status": "warn",
      "topicId": "sglt2i_ckd_cv",
      "validationPackId": "sglt2i_hf_benchmark",
      "id": "sglt2i_ckd_cv",
      "pack": {
        "id": "sglt2i_hf_benchmark",
        "meta": {
          "date": "2026-03-13",
          "id": "sglt2i_hf_benchmark",
          "name": "SGLT2 HF/CKD Golden Benchmark",
          "reference": {
            "journal": "Lancet",
            "title": "Vaduganathan et al. SGLT2 inhibitors in heart failure and kidney disease",
            "year": 2022
          },
          "summary": "Bundled golden HF and CKD benchmark outcomes aligned to Vaduganathan 2022 Lancet and CRES v5.0.",
          "tier": "exact",
          "verdict": "PASS"
        },
        "report_summary": null
      }
    },
    {
      "category": "Kidney Disease",
      "extraction": {
        "ctgov": {
          "has2x2": false,
          "hasReportedEffect": true,
          "hasResults": true,
          "matchScore": 57,
          "matchedOutcome": "All-cause Mortality",
          "recordExtract": "All-cause Mortality | Tx --/-- vs Ctrl --/--",
          "sampleNctId": "NCT02065791",
          "success": true
        },
        "pubmed": {
          "effectCount": 2,
          "firstExtract": "HR 10.68; 95%CI: 8.50-13.41",
          "pmid": "41765341",
          "success": true,
          "title": "SGLT2 inhibition in Patients with Type 2 Diabetes and CKD Experiencing a Deterioration in Estimated Glomerular Filtration Rate to <20ml/min/1.73m2."
        }
      },
      "failReasons": [
        "ctgov_anchor_recall"
      ],
      "name": "SGLT2 inhibitors - Chronic Kidney Disease - All-cause mortality",
      "policy": {
        "allowedSources": [
          "ctgov",
          "pubmed",
          "openalex"
        ],
        "extractionMode": "pubmed-abstract-and-ctgov-records-only",
        "pass": true,
        "pdfUploadHidden": true,
        "pdfViewerHidden": true,
        "yearFloor": 2015
      },
      "screening": {
        "humanCheckable": true,
        "recordsWithAnchors": 0
      },
      "search": {
        "ctgov": {
          "anchorRecall": 0,
          "count": 19,
          "eligible": 3,
          "firstResult": {
            "nctId": "NCT06578078",
            "title": "A Randomized Clinical Trial to Define the Best Strategy for the Management of Heart Failure and Chronic Kidney Disease Among Elderly Patients With or at High Risk of hyperKalemia in Span by Optimizing the Use of RAASi With SZC",
            "year": "2024"
          },
          "matched": [],
          "statusText": "CT.gov: kept 19 trials after applying the 2015+ floor"
        },
        "openalex": {
          "anchorRecall": 0.6666666666666666,
          "count": 20,
          "eligible": 3,
          "firstResult": {
            "doi": "10.1136/bmjdrc-2021-002484",
            "nctId": "NCT01986881",
            "pmid": "34620621",
            "title": "Glycemic efficacy and safety of the SGLT2 inhibitor ertugliflozin in patients with type 2 diabetes and stage 3 chronic kidney disease: an analysis from the VERTIS CV randomized trial",
            "year": "2021"
          },
          "matched": [
            "NCT03036150",
            "NCT02065791"
          ],
          "statusText": "OpenAlex: kept 20 records after applying the 2015+ floor"
        },
        "pubmed": {
          "anchorRecall": 1,
          "count": 20,
          "eligible": 3,
          "firstResult": {
            "doi": "10.1016/j.cardfail.2026.01.025",
            "nctId": "NCT05084235",
            "pmid": "41831639",
            "title": "The effect of empagliflozin on left ventricular mass and volumes in elderly individuals with overweight and high risk of heart failure: The Empire Prevent Cardiac Trial.",
            "year": "2026"
          },
          "matched": [
            "NCT03036150",
            "NCT02065791",
            "NCT03594110"
          ],
          "statusText": "517 total results (PubMed: 20)"
        }
      },
      "status": "warn",
      "topicId": "sglt2i_ckd_allcause",
      "validationPackId": "sglt2i_hf_benchmark",
      "id": "sglt2i_ckd_allcause",
      "pack": {
        "id": "sglt2i_hf_benchmark",
        "meta": {
          "date": "2026-03-13",
          "id": "sglt2i_hf_benchmark",
          "name": "SGLT2 HF/CKD Golden Benchmark",
          "reference": {
            "journal": "Lancet",
            "title": "Vaduganathan et al. SGLT2 inhibitors in heart failure and kidney disease",
            "year": 2022
          },
          "summary": "Bundled golden HF and CKD benchmark outcomes aligned to Vaduganathan 2022 Lancet and CRES v5.0.",
          "tier": "exact",
          "verdict": "PASS"
        },
        "report_summary": null
      }
    },
    {
      "category": "Kidney Disease",
      "extraction": {
        "ctgov": {
          "has2x2": false,
          "hasReportedEffect": true,
          "hasResults": true,
          "matchScore": 67,
          "matchedOutcome": "Primary Composite Endpoint of Doubling of Serum Creatinine (DoSC), End-stage Kidney Disease (ESKD), and Renal or Cardiovascular (CV) Death",
          "recordExtract": "Primary Composite Endpoint of Doubling of Serum Creatinine (DoSC), End-stage Kidney Disease (ESKD), and Renal or Cardiovascular (CV) Death | Tx --/-- vs Ctrl --/--",
          "sampleNctId": "NCT02065791",
          "success": true
        },
        "pubmed": {
          "effectCount": 2,
          "firstExtract": "HR 10.68; 95%CI: 8.50-13.41",
          "pmid": "41765341",
          "success": true,
          "title": "SGLT2 inhibition in Patients with Type 2 Diabetes and CKD Experiencing a Deterioration in Estimated Glomerular Filtration Rate to <20ml/min/1.73m2."
        }
      },
      "failReasons": [
        "ctgov_anchor_recall"
      ],
      "name": "SGLT2 inhibitors - Chronic Kidney Disease - Diabetes subgroup",
      "policy": {
        "allowedSources": [
          "ctgov",
          "pubmed",
          "openalex"
        ],
        "extractionMode": "pubmed-abstract-and-ctgov-records-only",
        "pass": true,
        "pdfUploadHidden": true,
        "pdfViewerHidden": true,
        "yearFloor": 2015
      },
      "screening": {
        "humanCheckable": true,
        "recordsWithAnchors": 0
      },
      "search": {
        "ctgov": {
          "anchorRecall": 0,
          "count": 19,
          "eligible": 3,
          "firstResult": {
            "nctId": "NCT06578078",
            "title": "A Randomized Clinical Trial to Define the Best Strategy for the Management of Heart Failure and Chronic Kidney Disease Among Elderly Patients With or at High Risk of hyperKalemia in Span by Optimizing the Use of RAASi With SZC",
            "year": "2024"
          },
          "matched": [],
          "statusText": "CT.gov: kept 19 trials after applying the 2015+ floor"
        },
        "openalex": {
          "anchorRecall": 0.6666666666666666,
          "count": 20,
          "eligible": 3,
          "firstResult": {
            "doi": "10.1136/bmjdrc-2021-002484",
            "nctId": "NCT01986881",
            "pmid": "34620621",
            "title": "Glycemic efficacy and safety of the SGLT2 inhibitor ertugliflozin in patients with type 2 diabetes and stage 3 chronic kidney disease: an analysis from the VERTIS CV randomized trial",
            "year": "2021"
          },
          "matched": [
            "NCT03036150",
            "NCT02065791"
          ],
          "statusText": "OpenAlex: kept 20 records after applying the 2015+ floor"
        },
        "pubmed": {
          "anchorRecall": 1,
          "count": 20,
          "eligible": 3,
          "firstResult": {
            "doi": "10.1016/j.cardfail.2026.01.025",
            "nctId": "NCT05084235",
            "pmid": "41831639",
            "title": "The effect of empagliflozin on left ventricular mass and volumes in elderly individuals with overweight and high risk of heart failure: The Empire Prevent Cardiac Trial.",
            "year": "2026"
          },
          "matched": [
            "NCT03036150",
            "NCT02065791",
            "NCT03594110"
          ],
          "statusText": "576 total results (PubMed: 20)"
        }
      },
      "status": "warn",
      "topicId": "sglt2i_ckd_diabetes",
      "validationPackId": "sglt2i_hf_benchmark",
      "id": "sglt2i_ckd_diabetes",
      "pack": {
        "id": "sglt2i_hf_benchmark",
        "meta": {
          "date": "2026-03-13",
          "id": "sglt2i_hf_benchmark",
          "name": "SGLT2 HF/CKD Golden Benchmark",
          "reference": {
            "journal": "Lancet",
            "title": "Vaduganathan et al. SGLT2 inhibitors in heart failure and kidney disease",
            "year": 2022
          },
          "summary": "Bundled golden HF and CKD benchmark outcomes aligned to Vaduganathan 2022 Lancet and CRES v5.0.",
          "tier": "exact",
          "verdict": "PASS"
        },
        "report_summary": null
      }
    },
    {
      "category": "Cardiovascular Outcomes",
      "extraction": {
        "ctgov": {
          "has2x2": false,
          "hasReportedEffect": true,
          "hasResults": true,
          "matchScore": 45,
          "matchedOutcome": "Percentage of Participants With the Composite of All Events Adjudicated (4-point MACE): CV Death (Including Fatal Stroke and Fatal MI), Non-fatal MI (Excluding Silent MI), Non-fatal Stroke and Hospitalization for Unstable Angina Pectoris",
          "recordExtract": "Percentage of Participants With the Composite of All Events Adjudicated (4-point MACE): CV Death (Including Fatal Stroke and Fatal MI), Non-fatal MI (Excluding Silent MI), Non-fatal Stroke and Hospitalization for Unstable Angina Pectoris | Tx --/-- vs Ctrl --/--",
          "sampleNctId": "NCT01131676",
          "success": true
        },
        "pubmed": {
          "effectCount": 3,
          "firstExtract": "RR: 0.80, 95% CI 0.69-0.93",
          "pmid": "41789221",
          "success": true,
          "title": "A network meta-analysis of safety and efficacy of sodium-glucose cotransporter 2 inhibitors in heart failure patients."
        }
      },
      "failReasons": [
        "ctgov_anchor_recall"
      ],
      "name": "SGLT2 inhibitors - CVOT - MACE",
      "policy": {
        "allowedSources": [
          "ctgov",
          "pubmed",
          "openalex"
        ],
        "extractionMode": "pubmed-abstract-and-ctgov-records-only",
        "pass": true,
        "pdfUploadHidden": true,
        "pdfViewerHidden": true,
        "yearFloor": 2015
      },
      "screening": {
        "humanCheckable": true,
        "recordsWithAnchors": 0
      },
      "search": {
        "ctgov": {
          "anchorRecall": 0,
          "count": 17,
          "eligible": 4,
          "firstResult": {
            "nctId": "NCT07294495",
            "title": "A Randomized, Double-Blind, Placebo-Controlled Clinical Trial to Evaluate the Effect of Henagliflozin on Myocardial Fibrosis Burden in Patients With Non-Obstructive Hypertrophic Cardiomyopathy Using 68Ga/18F-FAPI PET/CMR",
            "year": "2026"
          },
          "matched": [],
          "statusText": "CT.gov: kept 17 trials after applying the 2015+ floor"
        },
        "openalex": {
          "anchorRecall": 0.75,
          "count": 20,
          "eligible": 4,
          "firstResult": {
            "doi": "10.1016/j.pcd.2020.08.017",
            "pmid": "32912710",
            "title": "Comparison of the effects of 10 GLP-1 RA and SGLT2 inhibitor interventions on cardiovascular, mortality, and kidney outcomes in type 2 diabetes: A network meta-analysis of large randomized trials",
            "year": "2020"
          },
          "matched": [
            "NCT01131676",
            "NCT01032629",
            "NCT01730534"
          ],
          "statusText": "OpenAlex: kept 20 records after applying the 2015+ floor"
        },
        "pubmed": {
          "anchorRecall": 0,
          "count": 20,
          "eligible": 4,
          "firstResult": {
            "doi": "10.1016/j.jtcvs.2026.02.037",
            "pmid": "41831709",
            "title": "Sodium-glucose cotransporter 2 inhibitor use and outcomes after surgical aortic valve replacement.",
            "year": "2026"
          },
          "matched": [],
          "statusText": "633 total results (PubMed: 20)"
        }
      },
      "status": "warn",
      "topicId": "sglt2i_cvot_mace",
      "validationPackId": "sglt2i_cvot_exact",
      "id": "sglt2i_cvot_mace",
      "pack": {
        "id": "sglt2i_cvot_exact",
        "meta": {
          "counts": {
            "checksPassed": 10,
            "checksTotal": 10,
            "k": 5,
            "totalN": 46969
          },
          "date": "2026-02-27",
          "id": "sglt2i_cvot_exact",
          "name": "SGLT2 CVOT Exact Replication",
          "reference": {
            "doi": "10.1001/jamacardio.2020.4511",
            "journal": "JAMA Cardiology",
            "pmid": "33031522",
            "title": "Association of SGLT2 Inhibitors With Cardiovascular and Kidney Outcomes in Patients With Type 2 Diabetes: A Meta-analysis",
            "year": 2021
          },
          "sourcePath": "validation/reports/exact_replication_sglt2i/exact_replication_sglt2i_report.json",
          "summary": "10/10 checks passed against the bundled SGLT2 cardiovascular outcomes meta-analysis benchmark.",
          "tier": "exact",
          "verdict": "PASS"
        },
        "report_summary": {
          "k": 5,
          "total_n": 46969,
          "checks_passed": 10,
          "checks_total": 10,
          "all_passed": true,
          "verdict": "PASS"
        }
      }
    },
    {
      "category": "Cardiovascular Outcomes",
      "extraction": {
        "ctgov": {
          "has2x2": false,
          "hasReportedEffect": true,
          "hasResults": true,
          "matchScore": 75,
          "matchedOutcome": "Percentage of Participants With Heart Failure Requiring Hospitalisation (Adjudicated)",
          "recordExtract": "Percentage of Participants With Heart Failure Requiring Hospitalisation (Adjudicated) | Tx --/-- vs Ctrl --/--",
          "sampleNctId": "NCT01131676",
          "success": true
        },
        "pubmed": {
          "effectCount": 3,
          "firstExtract": "RR: 0.80, 95% CI 0.69-0.93",
          "pmid": "41789221",
          "success": true,
          "title": "A network meta-analysis of safety and efficacy of sodium-glucose cotransporter 2 inhibitors in heart failure patients."
        }
      },
      "failReasons": [
        "ctgov_anchor_recall"
      ],
      "name": "SGLT2 inhibitors - CVOT - HF hospitalization",
      "policy": {
        "allowedSources": [
          "ctgov",
          "pubmed",
          "openalex"
        ],
        "extractionMode": "pubmed-abstract-and-ctgov-records-only",
        "pass": true,
        "pdfUploadHidden": true,
        "pdfViewerHidden": true,
        "yearFloor": 2015
      },
      "screening": {
        "humanCheckable": true,
        "recordsWithAnchors": 0
      },
      "search": {
        "ctgov": {
          "anchorRecall": 0,
          "count": 17,
          "eligible": 4,
          "firstResult": {
            "nctId": "NCT07294495",
            "title": "A Randomized, Double-Blind, Placebo-Controlled Clinical Trial to Evaluate the Effect of Henagliflozin on Myocardial Fibrosis Burden in Patients With Non-Obstructive Hypertrophic Cardiomyopathy Using 68Ga/18F-FAPI PET/CMR",
            "year": "2026"
          },
          "matched": [],
          "statusText": "CT.gov: kept 17 trials after applying the 2015+ floor"
        },
        "openalex": {
          "anchorRecall": 0.75,
          "count": 20,
          "eligible": 4,
          "firstResult": {
            "doi": "10.1016/j.pcd.2020.08.017",
            "pmid": "32912710",
            "title": "Comparison of the effects of 10 GLP-1 RA and SGLT2 inhibitor interventions on cardiovascular, mortality, and kidney outcomes in type 2 diabetes: A network meta-analysis of large randomized trials",
            "year": "2020"
          },
          "matched": [
            "NCT01131676",
            "NCT01032629",
            "NCT01730534"
          ],
          "statusText": "OpenAlex: kept 20 records after applying the 2015+ floor"
        },
        "pubmed": {
          "anchorRecall": 0,
          "count": 20,
          "eligible": 4,
          "firstResult": {
            "doi": "10.1016/j.jtcvs.2026.02.037",
            "pmid": "41831709",
            "title": "Sodium-glucose cotransporter 2 inhibitor use and outcomes after surgical aortic valve replacement.",
            "year": "2026"
          },
          "matched": [],
          "statusText": "690 total results (PubMed: 20)"
        }
      },
      "status": "warn",
      "topicId": "sglt2i_cvot_hfh",
      "validationPackId": "sglt2i_cvot_exact",
      "id": "sglt2i_cvot_hfh",
      "pack": {
        "id": "sglt2i_cvot_exact",
        "meta": {
          "counts": {
            "checksPassed": 10,
            "checksTotal": 10,
            "k": 5,
            "totalN": 46969
          },
          "date": "2026-02-27",
          "id": "sglt2i_cvot_exact",
          "name": "SGLT2 CVOT Exact Replication",
          "reference": {
            "doi": "10.1001/jamacardio.2020.4511",
            "journal": "JAMA Cardiology",
            "pmid": "33031522",
            "title": "Association of SGLT2 Inhibitors With Cardiovascular and Kidney Outcomes in Patients With Type 2 Diabetes: A Meta-analysis",
            "year": 2021
          },
          "sourcePath": "validation/reports/exact_replication_sglt2i/exact_replication_sglt2i_report.json",
          "summary": "10/10 checks passed against the bundled SGLT2 cardiovascular outcomes meta-analysis benchmark.",
          "tier": "exact",
          "verdict": "PASS"
        },
        "report_summary": {
          "k": 5,
          "total_n": 46969,
          "checks_passed": 10,
          "checks_total": 10,
          "all_passed": true,
          "verdict": "PASS"
        }
      }
    },
    {
      "category": "Cardiovascular Outcomes",
      "extraction": {
        "ctgov": {
          "has2x2": false,
          "hasReportedEffect": true,
          "hasResults": true,
          "matchScore": 73,
          "matchedOutcome": "Time to the First Occurrence of Any of the Following Adjudicated Components of the Primary Composite Endpoint (3-point MACE): CV Death (Including Fatal Stroke and Fatal MI), Non-fatal MI (Excluding Silent MI), and Non-fatal Stroke.",
          "recordExtract": "Time to the First Occurrence of Any of the Following Adjudicated Components of the Primary Composite Endpoint (3-point MACE): CV Death (Including Fatal Stroke and Fatal MI), Non-fatal MI (Excluding Silent MI), and Non-fatal Stroke. | Tx --/-- vs Ctrl --/--",
          "sampleNctId": "NCT01131676",
          "success": true
        },
        "pubmed": {
          "effectCount": 3,
          "firstExtract": "RR: 0.80, 95% CI 0.69-0.93",
          "pmid": "41789221",
          "success": true,
          "title": "A network meta-analysis of safety and efficacy of sodium-glucose cotransporter 2 inhibitors in heart failure patients."
        }
      },
      "failReasons": [
        "ctgov_anchor_recall"
      ],
      "name": "SGLT2 inhibitors - CVOT - CV death",
      "policy": {
        "allowedSources": [
          "ctgov",
          "pubmed",
          "openalex"
        ],
        "extractionMode": "pubmed-abstract-and-ctgov-records-only",
        "pass": true,
        "pdfUploadHidden": true,
        "pdfViewerHidden": true,
        "yearFloor": 2015
      },
      "screening": {
        "humanCheckable": true,
        "recordsWithAnchors": 0
      },
      "search": {
        "ctgov": {
          "anchorRecall": 0,
          "count": 17,
          "eligible": 4,
          "firstResult": {
            "nctId": "NCT07294495",
            "title": "A Randomized, Double-Blind, Placebo-Controlled Clinical Trial to Evaluate the Effect of Henagliflozin on Myocardial Fibrosis Burden in Patients With Non-Obstructive Hypertrophic Cardiomyopathy Using 68Ga/18F-FAPI PET/CMR",
            "year": "2026"
          },
          "matched": [],
          "statusText": "CT.gov: kept 17 trials after applying the 2015+ floor"
        },
        "openalex": {
          "anchorRecall": 0.75,
          "count": 20,
          "eligible": 4,
          "firstResult": {
            "doi": "10.1016/j.pcd.2020.08.017",
            "pmid": "32912710",
            "title": "Comparison of the effects of 10 GLP-1 RA and SGLT2 inhibitor interventions on cardiovascular, mortality, and kidney outcomes in type 2 diabetes: A network meta-analysis of large randomized trials",
            "year": "2020"
          },
          "matched": [
            "NCT01131676",
            "NCT01032629",
            "NCT01730534"
          ],
          "statusText": "OpenAlex: kept 20 records after applying the 2015+ floor"
        },
        "pubmed": {
          "anchorRecall": 0,
          "count": 20,
          "eligible": 4,
          "firstResult": {
            "doi": "10.1016/j.jtcvs.2026.02.037",
            "pmid": "41831709",
            "title": "Sodium-glucose cotransporter 2 inhibitor use and outcomes after surgical aortic valve replacement.",
            "year": "2026"
          },
          "matched": [],
          "statusText": "747 total results (PubMed: 20)"
        }
      },
      "status": "warn",
      "topicId": "sglt2i_cvot_cvdeath",
      "validationPackId": "sglt2i_cvot_exact",
      "id": "sglt2i_cvot_cvdeath",
      "pack": {
        "id": "sglt2i_cvot_exact",
        "meta": {
          "counts": {
            "checksPassed": 10,
            "checksTotal": 10,
            "k": 5,
            "totalN": 46969
          },
          "date": "2026-02-27",
          "id": "sglt2i_cvot_exact",
          "name": "SGLT2 CVOT Exact Replication",
          "reference": {
            "doi": "10.1001/jamacardio.2020.4511",
            "journal": "JAMA Cardiology",
            "pmid": "33031522",
            "title": "Association of SGLT2 Inhibitors With Cardiovascular and Kidney Outcomes in Patients With Type 2 Diabetes: A Meta-analysis",
            "year": 2021
          },
          "sourcePath": "validation/reports/exact_replication_sglt2i/exact_replication_sglt2i_report.json",
          "summary": "10/10 checks passed against the bundled SGLT2 cardiovascular outcomes meta-analysis benchmark.",
          "tier": "exact",
          "verdict": "PASS"
        },
        "report_summary": {
          "k": 5,
          "total_n": 46969,
          "checks_passed": 10,
          "checks_total": 10,
          "all_passed": true,
          "verdict": "PASS"
        }
      }
    },
    {
      "category": "Cardiovascular Outcomes",
      "extraction": {
        "ctgov": {
          "has2x2": false,
          "hasReportedEffect": true,
          "hasResults": true,
          "matchScore": 43,
          "matchedOutcome": "Time to the First Occurrence of Any of the Following Adjudicated Components of the Primary Composite Endpoint (3-point MACE): CV Death (Including Fatal Stroke and Fatal MI), Non-fatal MI (Excluding Silent MI), and Non-fatal Stroke.",
          "recordExtract": "Time to the First Occurrence of Any of the Following Adjudicated Components of the Primary Composite Endpoint (3-point MACE): CV Death (Including Fatal Stroke and Fatal MI), Non-fatal MI (Excluding Silent MI), and Non-fatal Stroke. | Tx --/-- vs Ctrl --/--",
          "sampleNctId": "NCT01131676",
          "success": true
        },
        "pubmed": {
          "effectCount": 3,
          "firstExtract": "RR: 0.80, 95% CI 0.69-0.93",
          "pmid": "41789221",
          "success": true,
          "title": "A network meta-analysis of safety and efficacy of sodium-glucose cotransporter 2 inhibitors in heart failure patients."
        }
      },
      "failReasons": [
        "ctgov_anchor_recall"
      ],
      "name": "SGLT2 inhibitors - CVOT - All-cause mortality",
      "policy": {
        "allowedSources": [
          "ctgov",
          "pubmed",
          "openalex"
        ],
        "extractionMode": "pubmed-abstract-and-ctgov-records-only",
        "pass": true,
        "pdfUploadHidden": true,
        "pdfViewerHidden": true,
        "yearFloor": 2015
      },
      "screening": {
        "humanCheckable": true,
        "recordsWithAnchors": 0
      },
      "search": {
        "ctgov": {
          "anchorRecall": 0,
          "count": 17,
          "eligible": 4,
          "firstResult": {
            "nctId": "NCT07294495",
            "title": "A Randomized, Double-Blind, Placebo-Controlled Clinical Trial to Evaluate the Effect of Henagliflozin on Myocardial Fibrosis Burden in Patients With Non-Obstructive Hypertrophic Cardiomyopathy Using 68Ga/18F-FAPI PET/CMR",
            "year": "2026"
          },
          "matched": [],
          "statusText": "CT.gov: kept 17 trials after applying the 2015+ floor"
        },
        "openalex": {
          "anchorRecall": 0.75,
          "count": 20,
          "eligible": 4,
          "firstResult": {
            "doi": "10.1016/j.pcd.2020.08.017",
            "pmid": "32912710",
            "title": "Comparison of the effects of 10 GLP-1 RA and SGLT2 inhibitor interventions on cardiovascular, mortality, and kidney outcomes in type 2 diabetes: A network meta-analysis of large randomized trials",
            "year": "2020"
          },
          "matched": [
            "NCT01131676",
            "NCT01032629",
            "NCT01730534"
          ],
          "statusText": "OpenAlex: kept 20 records after applying the 2015+ floor"
        },
        "pubmed": {
          "anchorRecall": 0,
          "count": 20,
          "eligible": 4,
          "firstResult": {
            "doi": "10.1016/j.jtcvs.2026.02.037",
            "pmid": "41831709",
            "title": "Sodium-glucose cotransporter 2 inhibitor use and outcomes after surgical aortic valve replacement.",
            "year": "2026"
          },
          "matched": [],
          "statusText": "804 total results (PubMed: 20)"
        }
      },
      "status": "warn",
      "topicId": "sglt2i_cvot_allcause",
      "validationPackId": "sglt2i_cvot_exact",
      "id": "sglt2i_cvot_allcause",
      "pack": {
        "id": "sglt2i_cvot_exact",
        "meta": {
          "counts": {
            "checksPassed": 10,
            "checksTotal": 10,
            "k": 5,
            "totalN": 46969
          },
          "date": "2026-02-27",
          "id": "sglt2i_cvot_exact",
          "name": "SGLT2 CVOT Exact Replication",
          "reference": {
            "doi": "10.1001/jamacardio.2020.4511",
            "journal": "JAMA Cardiology",
            "pmid": "33031522",
            "title": "Association of SGLT2 Inhibitors With Cardiovascular and Kidney Outcomes in Patients With Type 2 Diabetes: A Meta-analysis",
            "year": 2021
          },
          "sourcePath": "validation/reports/exact_replication_sglt2i/exact_replication_sglt2i_report.json",
          "summary": "10/10 checks passed against the bundled SGLT2 cardiovascular outcomes meta-analysis benchmark.",
          "tier": "exact",
          "verdict": "PASS"
        },
        "report_summary": {
          "k": 5,
          "total_n": 46969,
          "checks_passed": 10,
          "checks_total": 10,
          "all_passed": true,
          "verdict": "PASS"
        }
      }
    },
    {
      "category": "Kidney Disease",
      "extraction": {
        "ctgov": {
          "has2x2": false,
          "hasReportedEffect": false,
          "hasResults": true,
          "matchScore": 98,
          "matchedOutcome": "The First Occurrence of the Composite Endpoint of Onset of Kidney Failure, a Sustained Decrease of eGFR \u226540% From Baseline Over at Least 4 Weeks, or Renal Death.",
          "recordExtract": "The First Occurrence of the Composite Endpoint of Onset of Kidney Failure, a Sustained Decrease of eGFR \u226540% From Baseline Over at Least 4 Weeks, or Renal Death. | Tx --/-- vs Ctrl --/--",
          "sampleNctId": "NCT02545049",
          "success": false
        },
        "pubmed": {
          "effectCount": 1,
          "firstExtract": "HR: 1.29; 95% CI, 1.06-1.56",
          "pmid": "41679125",
          "success": true,
          "title": "Finerenone increases the likelihood of improved KDIGO risk category in patients with CKD and type 2 diabetes: An analysis from FIDELITY."
        }
      },
      "failReasons": [
        "ctgov_extract"
      ],
      "name": "Finerenone - CKD with Type 2 Diabetes - Renal composite",
      "policy": {
        "allowedSources": [
          "ctgov",
          "pubmed",
          "openalex"
        ],
        "extractionMode": "pubmed-abstract-and-ctgov-records-only",
        "pass": true,
        "pdfUploadHidden": true,
        "pdfViewerHidden": true,
        "yearFloor": 2015
      },
      "screening": {
        "humanCheckable": true,
        "recordsWithAnchors": 2
      },
      "search": {
        "ctgov": {
          "anchorRecall": 1,
          "count": 19,
          "eligible": 2,
          "firstResult": {
            "nctId": "NCT07348718",
            "title": "Rubix LS DKD Equity Registry (RUBIX-DKD): A Prospective Observational Patient Registry to Characterize Diabetic Kidney Disease Trajectories, Treatment Patterns, and Outcomes in Underserved Communities and to Enable a Future Embedded Phase IV Pragmatic Study",
            "year": "2025"
          },
          "matched": [
            "NCT02540993",
            "NCT02545049"
          ],
          "statusText": "CT.gov: kept 19 trials after applying the 2015+ floor"
        },
        "openalex": {
          "anchorRecall": 1,
          "count": 20,
          "eligible": 2,
          "firstResult": {
            "doi": "10.1093/ndt/gfae132",
            "pmid": "38858818",
            "title": "Design and baseline characteristics of the Finerenone, in addition to standard of care, on the progression of kidney disease in patients with Non-Diabetic Chronic Kidney Disease (FIND-CKD) randomized trial",
            "year": "2024"
          },
          "matched": [
            "NCT02540993",
            "NCT02545049"
          ],
          "statusText": "OpenAlex: kept 20 records after applying the 2015+ floor"
        },
        "pubmed": {
          "anchorRecall": 1,
          "count": 20,
          "eligible": 2,
          "firstResult": {
            "doi": "10.1056/NEJMoa2512854",
            "nctId": "NCT05901831",
            "pmid": "41780000",
            "title": "Finerenone in Type 1 Diabetes and Chronic Kidney Disease.",
            "year": "2026"
          },
          "matched": [
            "NCT02540993",
            "NCT02545049"
          ],
          "statusText": "863 total results (PubMed: 20)"
        }
      },
      "status": "warn",
      "topicId": "finerenone_ckd_renal",
      "validationPackId": "pairwise70_cardio",
      "id": "finerenone_ckd_renal",
      "pack": {
        "id": "pairwise70_cardio",
        "meta": {
          "counts": {
            "error": 0,
            "fail": 0,
            "pass": 45,
            "passRate": 100,
            "prepared": 45
          },
          "date": "2026-02-27",
          "id": "pairwise70_cardio",
          "name": "Pairwise70 Cardio End-to-End",
          "sourcePath": "validation/reports/pairwise70_cardio_benchmark/pairwise70_cardio_end_to_end_report.json",
          "summary": "45/45 prepared cardiovascular datasets passed using ClinicalTrials.gov, PubMed, and OpenAlex only, with no PDF extraction pipeline.",
          "tier": "domain",
          "verdict": "PASS"
        },
        "report_summary": {
          "scope": {
            "domain": "cardiovascular",
            "design": "RCT-focused Pairwise70 Cochrane study-level",
            "sources": [
              "ClinicalTrials.gov",
              "AACT",
              "PubMed",
              "OpenAlex"
            ],
            "pdf_pipeline_used": false
          },
          "counts": {
            "cardio_review_ids": 52,
            "cardio_dataset_files": 47,
            "prepared_datasets": 45,
            "skipped_datasets": 2,
            "pass": 45,
            "fail": 0,
            "error": 0,
            "pass_rate": 100.0
          },
          "elapsed_seconds": 9.37
        }
      }
    },
    {
      "category": "Kidney Disease",
      "extraction": {
        "ctgov": {
          "has2x2": false,
          "hasReportedEffect": false,
          "hasResults": true,
          "matchScore": 98,
          "matchedOutcome": "The First Occurrence of the Composite Endpoint of Cardiovascular Death, Non-fatal Myocardial Infarction, Non Fatal Stroke, or Hospitalization for Heart Failure.",
          "recordExtract": "The First Occurrence of the Composite Endpoint of Cardiovascular Death, Non-fatal Myocardial Infarction, Non Fatal Stroke, or Hospitalization for Heart Failure. | Tx --/-- vs Ctrl --/--",
          "sampleNctId": "NCT02545049",
          "success": false
        },
        "pubmed": {
          "effectCount": 1,
          "firstExtract": "HR: 1.29; 95% CI, 1.06-1.56",
          "pmid": "41679125",
          "success": true,
          "title": "Finerenone increases the likelihood of improved KDIGO risk category in patients with CKD and type 2 diabetes: An analysis from FIDELITY."
        }
      },
      "failReasons": [
        "ctgov_extract"
      ],
      "name": "Finerenone - CKD with Type 2 Diabetes - CV composite",
      "policy": {
        "allowedSources": [
          "ctgov",
          "pubmed",
          "openalex"
        ],
        "extractionMode": "pubmed-abstract-and-ctgov-records-only",
        "pass": true,
        "pdfUploadHidden": true,
        "pdfViewerHidden": true,
        "yearFloor": 2015
      },
      "screening": {
        "humanCheckable": true,
        "recordsWithAnchors": 2
      },
      "search": {
        "ctgov": {
          "anchorRecall": 1,
          "count": 19,
          "eligible": 2,
          "firstResult": {
            "nctId": "NCT07348718",
            "title": "Rubix LS DKD Equity Registry (RUBIX-DKD): A Prospective Observational Patient Registry to Characterize Diabetic Kidney Disease Trajectories, Treatment Patterns, and Outcomes in Underserved Communities and to Enable a Future Embedded Phase IV Pragmatic Study",
            "year": "2025"
          },
          "matched": [
            "NCT02540993",
            "NCT02545049"
          ],
          "statusText": "CT.gov: kept 19 trials after applying the 2015+ floor"
        },
        "openalex": {
          "anchorRecall": 1,
          "count": 20,
          "eligible": 2,
          "firstResult": {
            "doi": "10.1093/ndt/gfae132",
            "pmid": "38858818",
            "title": "Design and baseline characteristics of the Finerenone, in addition to standard of care, on the progression of kidney disease in patients with Non-Diabetic Chronic Kidney Disease (FIND-CKD) randomized trial",
            "year": "2024"
          },
          "matched": [
            "NCT02540993",
            "NCT02545049"
          ],
          "statusText": "OpenAlex: kept 20 records after applying the 2015+ floor"
        },
        "pubmed": {
          "anchorRecall": 1,
          "count": 20,
          "eligible": 2,
          "firstResult": {
            "doi": "10.1056/NEJMoa2512854",
            "nctId": "NCT05901831",
            "pmid": "41780000",
            "title": "Finerenone in Type 1 Diabetes and Chronic Kidney Disease.",
            "year": "2026"
          },
          "matched": [
            "NCT02540993",
            "NCT02545049"
          ],
          "statusText": "922 total results (PubMed: 20)"
        }
      },
      "status": "warn",
      "topicId": "finerenone_ckd_cv",
      "validationPackId": "pairwise70_cardio",
      "id": "finerenone_ckd_cv",
      "pack": {
        "id": "pairwise70_cardio",
        "meta": {
          "counts": {
            "error": 0,
            "fail": 0,
            "pass": 45,
            "passRate": 100,
            "prepared": 45
          },
          "date": "2026-02-27",
          "id": "pairwise70_cardio",
          "name": "Pairwise70 Cardio End-to-End",
          "sourcePath": "validation/reports/pairwise70_cardio_benchmark/pairwise70_cardio_end_to_end_report.json",
          "summary": "45/45 prepared cardiovascular datasets passed using ClinicalTrials.gov, PubMed, and OpenAlex only, with no PDF extraction pipeline.",
          "tier": "domain",
          "verdict": "PASS"
        },
        "report_summary": {
          "scope": {
            "domain": "cardiovascular",
            "design": "RCT-focused Pairwise70 Cochrane study-level",
            "sources": [
              "ClinicalTrials.gov",
              "AACT",
              "PubMed",
              "OpenAlex"
            ],
            "pdf_pipeline_used": false
          },
          "counts": {
            "cardio_review_ids": 52,
            "cardio_dataset_files": 47,
            "prepared_datasets": 45,
            "skipped_datasets": 2,
            "pass": 45,
            "fail": 0,
            "error": 0,
            "pass_rate": 100.0
          },
          "elapsed_seconds": 9.37
        }
      }
    },
    {
      "category": "Kidney Disease",
      "extraction": {
        "ctgov": {
          "has2x2": false,
          "hasReportedEffect": false,
          "hasResults": true,
          "matchScore": 15,
          "matchedOutcome": "The First Occurrence of the Composite Endpoint of Cardiovascular Death, Non-fatal Myocardial Infarction, Non Fatal Stroke, or Hospitalization for Heart Failure.",
          "recordExtract": "The First Occurrence of the Composite Endpoint of Cardiovascular Death, Non-fatal Myocardial Infarction, Non Fatal Stroke, or Hospitalization for Heart Failure. | Tx --/-- vs Ctrl --/--",
          "sampleNctId": "NCT02545049",
          "success": false
        },
        "pubmed": {
          "effectCount": 1,
          "firstExtract": "HR: 1.29; 95% CI, 1.06-1.56",
          "pmid": "41679125",
          "success": true,
          "title": "Finerenone increases the likelihood of improved KDIGO risk category in patients with CKD and type 2 diabetes: An analysis from FIDELITY."
        }
      },
      "failReasons": [
        "ctgov_extract"
      ],
      "name": "Finerenone - CKD with Type 2 Diabetes - Hyperkalemia safety",
      "policy": {
        "allowedSources": [
          "ctgov",
          "pubmed",
          "openalex"
        ],
        "extractionMode": "pubmed-abstract-and-ctgov-records-only",
        "pass": true,
        "pdfUploadHidden": true,
        "pdfViewerHidden": true,
        "yearFloor": 2015
      },
      "screening": {
        "humanCheckable": true,
        "recordsWithAnchors": 2
      },
      "search": {
        "ctgov": {
          "anchorRecall": 1,
          "count": 19,
          "eligible": 2,
          "firstResult": {
            "nctId": "NCT07348718",
            "title": "Rubix LS DKD Equity Registry (RUBIX-DKD): A Prospective Observational Patient Registry to Characterize Diabetic Kidney Disease Trajectories, Treatment Patterns, and Outcomes in Underserved Communities and to Enable a Future Embedded Phase IV Pragmatic Study",
            "year": "2025"
          },
          "matched": [
            "NCT02540993",
            "NCT02545049"
          ],
          "statusText": "CT.gov: kept 19 trials after applying the 2015+ floor"
        },
        "openalex": {
          "anchorRecall": 1,
          "count": 20,
          "eligible": 2,
          "firstResult": {
            "doi": "10.1093/ndt/gfae132",
            "pmid": "38858818",
            "title": "Design and baseline characteristics of the Finerenone, in addition to standard of care, on the progression of kidney disease in patients with Non-Diabetic Chronic Kidney Disease (FIND-CKD) randomized trial",
            "year": "2024"
          },
          "matched": [
            "NCT02540993",
            "NCT02545049"
          ],
          "statusText": "OpenAlex: kept 20 records after applying the 2015+ floor"
        },
        "pubmed": {
          "anchorRecall": 1,
          "count": 20,
          "eligible": 2,
          "firstResult": {
            "doi": "10.1056/NEJMoa2512854",
            "nctId": "NCT05901831",
            "pmid": "41780000",
            "title": "Finerenone in Type 1 Diabetes and Chronic Kidney Disease.",
            "year": "2026"
          },
          "matched": [
            "NCT02540993",
            "NCT02545049"
          ],
          "statusText": "981 total results (PubMed: 20)"
        }
      },
      "status": "warn",
      "topicId": "finerenone_ckd_hyperkalemia",
      "validationPackId": "pairwise70_cardio",
      "id": "finerenone_ckd_hyperkalemia",
      "pack": {
        "id": "pairwise70_cardio",
        "meta": {
          "counts": {
            "error": 0,
            "fail": 0,
            "pass": 45,
            "passRate": 100,
            "prepared": 45
          },
          "date": "2026-02-27",
          "id": "pairwise70_cardio",
          "name": "Pairwise70 Cardio End-to-End",
          "sourcePath": "validation/reports/pairwise70_cardio_benchmark/pairwise70_cardio_end_to_end_report.json",
          "summary": "45/45 prepared cardiovascular datasets passed using ClinicalTrials.gov, PubMed, and OpenAlex only, with no PDF extraction pipeline.",
          "tier": "domain",
          "verdict": "PASS"
        },
        "report_summary": {
          "scope": {
            "domain": "cardiovascular",
            "design": "RCT-focused Pairwise70 Cochrane study-level",
            "sources": [
              "ClinicalTrials.gov",
              "AACT",
              "PubMed",
              "OpenAlex"
            ],
            "pdf_pipeline_used": false
          },
          "counts": {
            "cardio_review_ids": 52,
            "cardio_dataset_files": 47,
            "prepared_datasets": 45,
            "skipped_datasets": 2,
            "pass": 45,
            "fail": 0,
            "error": 0,
            "pass_rate": 100.0
          },
          "elapsed_seconds": 9.37
        }
      }
    },
    {
      "category": "Heart Failure",
      "extraction": {
        "ctgov": {
          "has2x2": false,
          "hasReportedEffect": false,
          "hasResults": true,
          "matchScore": 98,
          "matchedOutcome": "Change From Baseline in the Kansas City Cardiomyopathy Questionnaire (KCCQ) Clinical Summary Score (CSS)",
          "recordExtract": "Change From Baseline in the Kansas City Cardiomyopathy Questionnaire (KCCQ) Clinical Summary Score (CSS) | Tx --/-- vs Ctrl --/--",
          "sampleNctId": "NCT04847557",
          "success": false
        },
        "pubmed": {
          "effectCount": 1,
          "firstExtract": "odds ratio: 11.37 (95% confidence interval: 8.10-15.98",
          "pmid": "41824845",
          "success": true,
          "title": "GLP-1 receptor agonists for weight loss: A systematic review and meta-analysis of randomized controlled trials."
        }
      },
      "failReasons": [
        "ctgov_anchor_recall",
        "ctgov_extract"
      ],
      "name": "Incretin therapies - HFpEF and obesity - KCCQ clinical status",
      "policy": {
        "allowedSources": [
          "ctgov",
          "pubmed",
          "openalex"
        ],
        "extractionMode": "pubmed-abstract-and-ctgov-records-only",
        "pass": true,
        "pdfUploadHidden": true,
        "pdfViewerHidden": true,
        "yearFloor": 2015
      },
      "screening": {
        "humanCheckable": true,
        "recordsWithAnchors": 0
      },
      "search": {
        "ctgov": {
          "anchorRecall": 0,
          "count": 16,
          "eligible": 3,
          "firstResult": {
            "nctId": "NCT05598008",
            "title": "The Desire PLUS Study - Effects of Glucagon-like-Peptide-1 Analogues on Sexuality: a Prospective Open-label Study",
            "year": "2022"
          },
          "matched": [],
          "statusText": "CT.gov: kept 16 trials after applying the 2015+ floor"
        },
        "openalex": {
          "anchorRecall": 1,
          "count": 20,
          "eligible": 3,
          "firstResult": {
            "doi": "10.1093/eurheartj/ehad192",
            "pmid": "37622663",
            "title": "2023 ESC Guidelines for the management of cardiovascular disease in patients with diabetes",
            "year": "2023"
          },
          "matched": [
            "NCT04788511",
            "NCT04916470",
            "NCT04847557"
          ],
          "statusText": "OpenAlex: kept 20 records after applying the 2015+ floor"
        },
        "pubmed": {
          "anchorRecall": 0.6666666666666666,
          "count": 20,
          "eligible": 3,
          "firstResult": {
            "doi": "10.1097/MD.0000000000047994",
            "pmid": "41824845",
            "title": "GLP-1 receptor agonists for weight loss: A systematic review and meta-analysis of randomized controlled trials.",
            "year": "2026"
          },
          "matched": [
            "NCT04788511",
            "NCT04916470"
          ],
          "statusText": "1037 total results (PubMed: 20)"
        }
      },
      "status": "warn",
      "topicId": "incretin_hfpef_kccq",
      "validationPackId": "pairwise70_cardio",
      "id": "incretin_hfpef_kccq",
      "pack": {
        "id": "pairwise70_cardio",
        "meta": {
          "counts": {
            "error": 0,
            "fail": 0,
            "pass": 45,
            "passRate": 100,
            "prepared": 45
          },
          "date": "2026-02-27",
          "id": "pairwise70_cardio",
          "name": "Pairwise70 Cardio End-to-End",
          "sourcePath": "validation/reports/pairwise70_cardio_benchmark/pairwise70_cardio_end_to_end_report.json",
          "summary": "45/45 prepared cardiovascular datasets passed using ClinicalTrials.gov, PubMed, and OpenAlex only, with no PDF extraction pipeline.",
          "tier": "domain",
          "verdict": "PASS"
        },
        "report_summary": {
          "scope": {
            "domain": "cardiovascular",
            "design": "RCT-focused Pairwise70 Cochrane study-level",
            "sources": [
              "ClinicalTrials.gov",
              "AACT",
              "PubMed",
              "OpenAlex"
            ],
            "pdf_pipeline_used": false
          },
          "counts": {
            "cardio_review_ids": 52,
            "cardio_dataset_files": 47,
            "prepared_datasets": 45,
            "skipped_datasets": 2,
            "pass": 45,
            "fail": 0,
            "error": 0,
            "pass_rate": 100.0
          },
          "elapsed_seconds": 9.37
        }
      }
    },
    {
      "category": "Heart Failure",
      "extraction": {
        "ctgov": {
          "has2x2": false,
          "hasReportedEffect": false,
          "hasResults": true,
          "matchScore": 39,
          "matchedOutcome": "Percent Change From Baseline in Body Weight",
          "recordExtract": "Percent Change From Baseline in Body Weight | Tx --/-- vs Ctrl --/--",
          "sampleNctId": "NCT04847557",
          "success": false
        },
        "pubmed": {
          "effectCount": 1,
          "firstExtract": "odds ratio: 11.37 (95% confidence interval: 8.10-15.98",
          "pmid": "41824845",
          "success": true,
          "title": "GLP-1 receptor agonists for weight loss: A systematic review and meta-analysis of randomized controlled trials."
        }
      },
      "failReasons": [
        "ctgov_anchor_recall",
        "ctgov_extract"
      ],
      "name": "Incretin therapies - HFpEF and obesity - Body weight",
      "policy": {
        "allowedSources": [
          "ctgov",
          "pubmed",
          "openalex"
        ],
        "extractionMode": "pubmed-abstract-and-ctgov-records-only",
        "pass": true,
        "pdfUploadHidden": true,
        "pdfViewerHidden": true,
        "yearFloor": 2015
      },
      "screening": {
        "humanCheckable": true,
        "recordsWithAnchors": 0
      },
      "search": {
        "ctgov": {
          "anchorRecall": 0,
          "count": 16,
          "eligible": 3,
          "firstResult": {
            "nctId": "NCT05598008",
            "title": "The Desire PLUS Study - Effects of Glucagon-like-Peptide-1 Analogues on Sexuality: a Prospective Open-label Study",
            "year": "2022"
          },
          "matched": [],
          "statusText": "CT.gov: kept 16 trials after applying the 2015+ floor"
        },
        "openalex": {
          "anchorRecall": 1,
          "count": 20,
          "eligible": 3,
          "firstResult": {
            "doi": "10.1093/eurheartj/ehad192",
            "pmid": "37622663",
            "title": "2023 ESC Guidelines for the management of cardiovascular disease in patients with diabetes",
            "year": "2023"
          },
          "matched": [
            "NCT04788511",
            "NCT04916470",
            "NCT04847557"
          ],
          "statusText": "OpenAlex: kept 20 records after applying the 2015+ floor"
        },
        "pubmed": {
          "anchorRecall": 0.6666666666666666,
          "count": 20,
          "eligible": 3,
          "firstResult": {
            "doi": "10.1097/MD.0000000000047994",
            "pmid": "41824845",
            "title": "GLP-1 receptor agonists for weight loss: A systematic review and meta-analysis of randomized controlled trials.",
            "year": "2026"
          },
          "matched": [
            "NCT04788511",
            "NCT04916470"
          ],
          "statusText": "1093 total results (PubMed: 20)"
        }
      },
      "status": "warn",
      "topicId": "incretin_hfpef_weight",
      "validationPackId": "pairwise70_cardio",
      "id": "incretin_hfpef_weight",
      "pack": {
        "id": "pairwise70_cardio",
        "meta": {
          "counts": {
            "error": 0,
            "fail": 0,
            "pass": 45,
            "passRate": 100,
            "prepared": 45
          },
          "date": "2026-02-27",
          "id": "pairwise70_cardio",
          "name": "Pairwise70 Cardio End-to-End",
          "sourcePath": "validation/reports/pairwise70_cardio_benchmark/pairwise70_cardio_end_to_end_report.json",
          "summary": "45/45 prepared cardiovascular datasets passed using ClinicalTrials.gov, PubMed, and OpenAlex only, with no PDF extraction pipeline.",
          "tier": "domain",
          "verdict": "PASS"
        },
        "report_summary": {
          "scope": {
            "domain": "cardiovascular",
            "design": "RCT-focused Pairwise70 Cochrane study-level",
            "sources": [
              "ClinicalTrials.gov",
              "AACT",
              "PubMed",
              "OpenAlex"
            ],
            "pdf_pipeline_used": false
          },
          "counts": {
            "cardio_review_ids": 52,
            "cardio_dataset_files": 47,
            "prepared_datasets": 45,
            "skipped_datasets": 2,
            "pass": 45,
            "fail": 0,
            "error": 0,
            "pass_rate": 100.0
          },
          "elapsed_seconds": 9.37
        }
      }
    },
    {
      "category": "Heart Failure",
      "extraction": {
        "ctgov": {
          "has2x2": false,
          "hasReportedEffect": false,
          "hasResults": true,
          "matchScore": 57,
          "matchedOutcome": "First Occurrence of the Composite Endpoint of Heart Failure (HF) Outcomes",
          "recordExtract": "First Occurrence of the Composite Endpoint of Heart Failure (HF) Outcomes | Tx --/-- vs Ctrl --/--",
          "sampleNctId": "NCT04847557",
          "success": false
        },
        "pubmed": {
          "effectCount": 1,
          "firstExtract": "odds ratio: 11.37 (95% confidence interval: 8.10-15.98",
          "pmid": "41824845",
          "success": true,
          "title": "GLP-1 receptor agonists for weight loss: A systematic review and meta-analysis of randomized controlled trials."
        }
      },
      "failReasons": [
        "ctgov_anchor_recall",
        "ctgov_extract"
      ],
      "name": "Incretin therapies - HFpEF and obesity - HF events",
      "policy": {
        "allowedSources": [
          "ctgov",
          "pubmed",
          "openalex"
        ],
        "extractionMode": "pubmed-abstract-and-ctgov-records-only",
        "pass": true,
        "pdfUploadHidden": true,
        "pdfViewerHidden": true,
        "yearFloor": 2015
      },
      "screening": {
        "humanCheckable": true,
        "recordsWithAnchors": 0
      },
      "search": {
        "ctgov": {
          "anchorRecall": 0,
          "count": 16,
          "eligible": 3,
          "firstResult": {
            "nctId": "NCT05598008",
            "title": "The Desire PLUS Study - Effects of Glucagon-like-Peptide-1 Analogues on Sexuality: a Prospective Open-label Study",
            "year": "2022"
          },
          "matched": [],
          "statusText": "CT.gov: kept 16 trials after applying the 2015+ floor"
        },
        "openalex": {
          "anchorRecall": 1,
          "count": 20,
          "eligible": 3,
          "firstResult": {
            "doi": "10.1093/eurheartj/ehad192",
            "pmid": "37622663",
            "title": "2023 ESC Guidelines for the management of cardiovascular disease in patients with diabetes",
            "year": "2023"
          },
          "matched": [
            "NCT04788511",
            "NCT04916470",
            "NCT04847557"
          ],
          "statusText": "OpenAlex: kept 20 records after applying the 2015+ floor"
        },
        "pubmed": {
          "anchorRecall": 0.6666666666666666,
          "count": 20,
          "eligible": 3,
          "firstResult": {
            "doi": "10.1097/MD.0000000000047994",
            "pmid": "41824845",
            "title": "GLP-1 receptor agonists for weight loss: A systematic review and meta-analysis of randomized controlled trials.",
            "year": "2026"
          },
          "matched": [
            "NCT04788511",
            "NCT04916470"
          ],
          "statusText": "1149 total results (PubMed: 20)"
        }
      },
      "status": "warn",
      "topicId": "incretin_hfpef_totalhf",
      "validationPackId": "pairwise70_cardio",
      "id": "incretin_hfpef_totalhf",
      "pack": {
        "id": "pairwise70_cardio",
        "meta": {
          "counts": {
            "error": 0,
            "fail": 0,
            "pass": 45,
            "passRate": 100,
            "prepared": 45
          },
          "date": "2026-02-27",
          "id": "pairwise70_cardio",
          "name": "Pairwise70 Cardio End-to-End",
          "sourcePath": "validation/reports/pairwise70_cardio_benchmark/pairwise70_cardio_end_to_end_report.json",
          "summary": "45/45 prepared cardiovascular datasets passed using ClinicalTrials.gov, PubMed, and OpenAlex only, with no PDF extraction pipeline.",
          "tier": "domain",
          "verdict": "PASS"
        },
        "report_summary": {
          "scope": {
            "domain": "cardiovascular",
            "design": "RCT-focused Pairwise70 Cochrane study-level",
            "sources": [
              "ClinicalTrials.gov",
              "AACT",
              "PubMed",
              "OpenAlex"
            ],
            "pdf_pipeline_used": false
          },
          "counts": {
            "cardio_review_ids": 52,
            "cardio_dataset_files": 47,
            "prepared_datasets": 45,
            "skipped_datasets": 2,
            "pass": 45,
            "fail": 0,
            "error": 0,
            "pass_rate": 100.0
          },
          "elapsed_seconds": 9.37
        }
      }
    },
    {
      "category": "Cardiovascular Outcomes",
      "extraction": {
        "ctgov": {
          "has2x2": false,
          "hasReportedEffect": false,
          "hasResults": true,
          "matchScore": 98,
          "matchedOutcome": "Time to First Occurrence of Major Adverse Cardiovascular Events (MACE): Event Rate Per 100 Participant-years for First Occurrence of Major Cardiovascular (CV) Event - Non-Inferiority Analysis",
          "recordExtract": "Time to First Occurrence of Major Adverse Cardiovascular Events (MACE): Event Rate Per 100 Participant-years for First Occurrence of Major Cardiovascular (CV) Event - Non-Inferiority Analysis | Tx --/-- vs Ctrl --/--",
          "sampleNctId": "NCT03496298",
          "success": false
        },
        "pubmed": {
          "effectCount": 1,
          "firstExtract": "HR 1.14 [95% CI, 0.89-1.46]",
          "pmid": "41711744",
          "success": true,
          "title": "Semaglutide vs tirzepatide in patients with obesity and HFpEF: a report from a global federated research network."
        }
      },
      "failReasons": [
        "ctgov_extract"
      ],
      "name": "GLP-1 receptor agonists - CVOT - MACE",
      "policy": {
        "allowedSources": [
          "ctgov",
          "pubmed",
          "openalex"
        ],
        "extractionMode": "pubmed-abstract-and-ctgov-records-only",
        "pass": true,
        "pdfUploadHidden": true,
        "pdfViewerHidden": true,
        "yearFloor": 2015
      },
      "screening": {
        "humanCheckable": true,
        "recordsWithAnchors": 1
      },
      "search": {
        "ctgov": {
          "anchorRecall": 0.125,
          "count": 16,
          "eligible": 8,
          "firstResult": {
            "nctId": "NCT05819138",
            "title": "Type 1 Diabetes Impacts of Semaglutide on Cardiovascular Outcomes",
            "year": "2023"
          },
          "matched": [
            "NCT02465515"
          ],
          "statusText": "CT.gov: kept 16 trials after applying the 2015+ floor"
        },
        "openalex": {
          "anchorRecall": 0.625,
          "count": 20,
          "eligible": 8,
          "firstResult": {
            "doi": "10.23736/s2724-6507.20.03219-8",
            "title": "Pancreatitis and pancreatic cancer in patients with type 2 diabetes treated with glucagon-like peptide-1 receptor agonists: an updated meta-analysis of randomized controlled trials",
            "year": "2023"
          },
          "matched": [
            "NCT01179048",
            "NCT01720446",
            "NCT01144338",
            "NCT01394952",
            "NCT03496298"
          ],
          "statusText": "OpenAlex: kept 20 records after applying the 2015+ floor"
        },
        "pubmed": {
          "anchorRecall": 0.25,
          "count": 20,
          "eligible": 8,
          "firstResult": {
            "doi": "10.59556/japi.74.1375",
            "pmid": "41818087",
            "title": "National Consensus on Semaglutide in Cardiology: From Clinical Evidence to Clinical Translation.",
            "year": "2026"
          },
          "matched": [
            "NCT01720446",
            "NCT02692716"
          ],
          "statusText": "1205 total results (PubMed: 20)"
        }
      },
      "status": "warn",
      "topicId": "glp1_cvot_mace",
      "validationPackId": "glp1_cvot_exact",
      "id": "glp1_cvot_mace",
      "pack": {
        "id": "glp1_cvot_exact",
        "meta": {
          "counts": {
            "checksPassed": 11,
            "checksTotal": 11,
            "k": 10,
            "totalN": 73263
          },
          "date": "2026-02-27",
          "id": "glp1_cvot_exact",
          "name": "GLP-1 CVOT Exact Replication",
          "reference": {
            "doi": "10.1111/dom.70121",
            "journal": "Diabetes, Obesity & Metabolism",
            "pmid": "40926380",
            "title": "Cardiovascular risk reduction with GLP-1 receptor agonists is proportional to HbA1c lowering in type 2 diabetes",
            "year": 2025
          },
          "sourcePath": "validation/reports/exact_replication_glp1/exact_replication_glp1_report.json",
          "summary": "11/11 checks passed against the bundled GLP-1 cardiovascular outcomes meta-analysis benchmark.",
          "tier": "exact",
          "verdict": "PASS"
        },
        "report_summary": {
          "k": 10,
          "total_n": 73263,
          "checks_passed": 11,
          "checks_total": 11,
          "all_passed": true,
          "verdict": "PASS"
        }
      }
    },
    {
      "category": "Cardiovascular Outcomes",
      "extraction": {
        "ctgov": {
          "has2x2": false,
          "hasReportedEffect": false,
          "hasResults": true,
          "matchScore": 33,
          "matchedOutcome": "Time to First Occurrence of Major Adverse Cardiovascular Events (MACE): Event Rate Per 100 Participant-years for First Occurrence of Major Cardiovascular (CV) Event - Non-Inferiority Analysis",
          "recordExtract": "Time to First Occurrence of Major Adverse Cardiovascular Events (MACE): Event Rate Per 100 Participant-years for First Occurrence of Major Cardiovascular (CV) Event - Non-Inferiority Analysis | Tx --/-- vs Ctrl --/--",
          "sampleNctId": "NCT03496298",
          "success": false
        },
        "pubmed": {
          "effectCount": 1,
          "firstExtract": "HR 1.14 [95% CI, 0.89-1.46]",
          "pmid": "41711744",
          "success": true,
          "title": "Semaglutide vs tirzepatide in patients with obesity and HFpEF: a report from a global federated research network."
        }
      },
      "failReasons": [
        "ctgov_extract"
      ],
      "name": "GLP-1 receptor agonists - CVOT - Stroke",
      "policy": {
        "allowedSources": [
          "ctgov",
          "pubmed",
          "openalex"
        ],
        "extractionMode": "pubmed-abstract-and-ctgov-records-only",
        "pass": true,
        "pdfUploadHidden": true,
        "pdfViewerHidden": true,
        "yearFloor": 2015
      },
      "screening": {
        "humanCheckable": true,
        "recordsWithAnchors": 1
      },
      "search": {
        "ctgov": {
          "anchorRecall": 0.125,
          "count": 16,
          "eligible": 8,
          "firstResult": {
            "nctId": "NCT05819138",
            "title": "Type 1 Diabetes Impacts of Semaglutide on Cardiovascular Outcomes",
            "year": "2023"
          },
          "matched": [
            "NCT02465515"
          ],
          "statusText": "CT.gov: kept 16 trials after applying the 2015+ floor"
        },
        "openalex": {
          "anchorRecall": 0.625,
          "count": 20,
          "eligible": 8,
          "firstResult": {
            "doi": "10.23736/s2724-6507.20.03219-8",
            "title": "Pancreatitis and pancreatic cancer in patients with type 2 diabetes treated with glucagon-like peptide-1 receptor agonists: an updated meta-analysis of randomized controlled trials",
            "year": "2023"
          },
          "matched": [
            "NCT01179048",
            "NCT01720446",
            "NCT01144338",
            "NCT01394952",
            "NCT03496298"
          ],
          "statusText": "OpenAlex: kept 20 records after applying the 2015+ floor"
        },
        "pubmed": {
          "anchorRecall": 0.25,
          "count": 20,
          "eligible": 8,
          "firstResult": {
            "doi": "10.59556/japi.74.1375",
            "pmid": "41818087",
            "title": "National Consensus on Semaglutide in Cardiology: From Clinical Evidence to Clinical Translation.",
            "year": "2026"
          },
          "matched": [
            "NCT01720446",
            "NCT02692716"
          ],
          "statusText": "1261 total results (PubMed: 20)"
        }
      },
      "status": "warn",
      "topicId": "glp1_cvot_stroke",
      "validationPackId": "glp1_cvot_exact",
      "id": "glp1_cvot_stroke",
      "pack": {
        "id": "glp1_cvot_exact",
        "meta": {
          "counts": {
            "checksPassed": 11,
            "checksTotal": 11,
            "k": 10,
            "totalN": 73263
          },
          "date": "2026-02-27",
          "id": "glp1_cvot_exact",
          "name": "GLP-1 CVOT Exact Replication",
          "reference": {
            "doi": "10.1111/dom.70121",
            "journal": "Diabetes, Obesity & Metabolism",
            "pmid": "40926380",
            "title": "Cardiovascular risk reduction with GLP-1 receptor agonists is proportional to HbA1c lowering in type 2 diabetes",
            "year": 2025
          },
          "sourcePath": "validation/reports/exact_replication_glp1/exact_replication_glp1_report.json",
          "summary": "11/11 checks passed against the bundled GLP-1 cardiovascular outcomes meta-analysis benchmark.",
          "tier": "exact",
          "verdict": "PASS"
        },
        "report_summary": {
          "k": 10,
          "total_n": 73263,
          "checks_passed": 11,
          "checks_total": 11,
          "all_passed": true,
          "verdict": "PASS"
        }
      }
    },
    {
      "category": "Cardiovascular Outcomes",
      "extraction": {
        "ctgov": {
          "has2x2": false,
          "hasReportedEffect": false,
          "hasResults": true,
          "matchScore": 15,
          "matchedOutcome": "Time to First Occurrence of Major Adverse Cardiovascular Events (MACE): Event Rate Per 100 Participant-years for First Occurrence of Major Cardiovascular (CV) Event - Non-Inferiority Analysis",
          "recordExtract": "Time to First Occurrence of Major Adverse Cardiovascular Events (MACE): Event Rate Per 100 Participant-years for First Occurrence of Major Cardiovascular (CV) Event - Non-Inferiority Analysis | Tx --/-- vs Ctrl --/--",
          "sampleNctId": "NCT03496298",
          "success": false
        },
        "pubmed": {
          "effectCount": 1,
          "firstExtract": "HR 1.14 [95% CI, 0.89-1.46]",
          "pmid": "41711744",
          "success": true,
          "title": "Semaglutide vs tirzepatide in patients with obesity and HFpEF: a report from a global federated research network."
        }
      },
      "failReasons": [
        "ctgov_extract"
      ],
      "name": "GLP-1 receptor agonists - CVOT - All-cause mortality",
      "policy": {
        "allowedSources": [
          "ctgov",
          "pubmed",
          "openalex"
        ],
        "extractionMode": "pubmed-abstract-and-ctgov-records-only",
        "pass": true,
        "pdfUploadHidden": true,
        "pdfViewerHidden": true,
        "yearFloor": 2015
      },
      "screening": {
        "humanCheckable": true,
        "recordsWithAnchors": 1
      },
      "search": {
        "ctgov": {
          "anchorRecall": 0.125,
          "count": 16,
          "eligible": 8,
          "firstResult": {
            "nctId": "NCT05819138",
            "title": "Type 1 Diabetes Impacts of Semaglutide on Cardiovascular Outcomes",
            "year": "2023"
          },
          "matched": [
            "NCT02465515"
          ],
          "statusText": "CT.gov: kept 16 trials after applying the 2015+ floor"
        },
        "openalex": {
          "anchorRecall": 0.625,
          "count": 20,
          "eligible": 8,
          "firstResult": {
            "doi": "10.23736/s2724-6507.20.03219-8",
            "title": "Pancreatitis and pancreatic cancer in patients with type 2 diabetes treated with glucagon-like peptide-1 receptor agonists: an updated meta-analysis of randomized controlled trials",
            "year": "2023"
          },
          "matched": [
            "NCT01179048",
            "NCT01720446",
            "NCT01144338",
            "NCT01394952",
            "NCT03496298"
          ],
          "statusText": "OpenAlex: kept 20 records after applying the 2015+ floor"
        },
        "pubmed": {
          "anchorRecall": 0.25,
          "count": 20,
          "eligible": 8,
          "firstResult": {
            "doi": "10.59556/japi.74.1375",
            "pmid": "41818087",
            "title": "National Consensus on Semaglutide in Cardiology: From Clinical Evidence to Clinical Translation.",
            "year": "2026"
          },
          "matched": [
            "NCT01720446",
            "NCT02692716"
          ],
          "statusText": "1317 total results (PubMed: 20)"
        }
      },
      "status": "warn",
      "topicId": "glp1_cvot_allcause",
      "validationPackId": "glp1_cvot_exact",
      "id": "glp1_cvot_allcause",
      "pack": {
        "id": "glp1_cvot_exact",
        "meta": {
          "counts": {
            "checksPassed": 11,
            "checksTotal": 11,
            "k": 10,
            "totalN": 73263
          },
          "date": "2026-02-27",
          "id": "glp1_cvot_exact",
          "name": "GLP-1 CVOT Exact Replication",
          "reference": {
            "doi": "10.1111/dom.70121",
            "journal": "Diabetes, Obesity & Metabolism",
            "pmid": "40926380",
            "title": "Cardiovascular risk reduction with GLP-1 receptor agonists is proportional to HbA1c lowering in type 2 diabetes",
            "year": 2025
          },
          "sourcePath": "validation/reports/exact_replication_glp1/exact_replication_glp1_report.json",
          "summary": "11/11 checks passed against the bundled GLP-1 cardiovascular outcomes meta-analysis benchmark.",
          "tier": "exact",
          "verdict": "PASS"
        },
        "report_summary": {
          "k": 10,
          "total_n": 73263,
          "checks_passed": 11,
          "checks_total": 11,
          "all_passed": true,
          "verdict": "PASS"
        }
      }
    },
    {
      "category": "Cardiovascular Outcomes",
      "extraction": {
        "ctgov": {
          "has2x2": false,
          "hasReportedEffect": false,
          "hasResults": true,
          "matchScore": 33,
          "matchedOutcome": "Time to First Occurrence of Major Adverse Cardiovascular Events (MACE): Event Rate Per 100 Participant-years for First Occurrence of Major Cardiovascular (CV) Event - Non-Inferiority Analysis",
          "recordExtract": "Time to First Occurrence of Major Adverse Cardiovascular Events (MACE): Event Rate Per 100 Participant-years for First Occurrence of Major Cardiovascular (CV) Event - Non-Inferiority Analysis | Tx --/-- vs Ctrl --/--",
          "sampleNctId": "NCT03496298",
          "success": false
        },
        "pubmed": {
          "effectCount": 1,
          "firstExtract": "HR 1.14 [95% CI, 0.89-1.46]",
          "pmid": "41711744",
          "success": true,
          "title": "Semaglutide vs tirzepatide in patients with obesity and HFpEF: a report from a global federated research network."
        }
      },
      "failReasons": [
        "ctgov_extract"
      ],
      "name": "GLP-1 receptor agonists - CVOT - HF hospitalization",
      "policy": {
        "allowedSources": [
          "ctgov",
          "pubmed",
          "openalex"
        ],
        "extractionMode": "pubmed-abstract-and-ctgov-records-only",
        "pass": true,
        "pdfUploadHidden": true,
        "pdfViewerHidden": true,
        "yearFloor": 2015
      },
      "screening": {
        "humanCheckable": true,
        "recordsWithAnchors": 1
      },
      "search": {
        "ctgov": {
          "anchorRecall": 0.125,
          "count": 16,
          "eligible": 8,
          "firstResult": {
            "nctId": "NCT05819138",
            "title": "Type 1 Diabetes Impacts of Semaglutide on Cardiovascular Outcomes",
            "year": "2023"
          },
          "matched": [
            "NCT02465515"
          ],
          "statusText": "CT.gov: kept 16 trials after applying the 2015+ floor"
        },
        "openalex": {
          "anchorRecall": 0.625,
          "count": 20,
          "eligible": 8,
          "firstResult": {
            "doi": "10.23736/s2724-6507.20.03219-8",
            "title": "Pancreatitis and pancreatic cancer in patients with type 2 diabetes treated with glucagon-like peptide-1 receptor agonists: an updated meta-analysis of randomized controlled trials",
            "year": "2023"
          },
          "matched": [
            "NCT01179048",
            "NCT01720446",
            "NCT01144338",
            "NCT01394952",
            "NCT03496298"
          ],
          "statusText": "OpenAlex: kept 20 records after applying the 2015+ floor"
        },
        "pubmed": {
          "anchorRecall": 0.25,
          "count": 20,
          "eligible": 8,
          "firstResult": {
            "doi": "10.59556/japi.74.1375",
            "pmid": "41818087",
            "title": "National Consensus on Semaglutide in Cardiology: From Clinical Evidence to Clinical Translation.",
            "year": "2026"
          },
          "matched": [
            "NCT01720446",
            "NCT02692716"
          ],
          "statusText": "1373 total results (PubMed: 20)"
        }
      },
      "status": "warn",
      "topicId": "glp1_cvot_hfh",
      "validationPackId": "glp1_cvot_exact",
      "id": "glp1_cvot_hfh",
      "pack": {
        "id": "glp1_cvot_exact",
        "meta": {
          "counts": {
            "checksPassed": 11,
            "checksTotal": 11,
            "k": 10,
            "totalN": 73263
          },
          "date": "2026-02-27",
          "id": "glp1_cvot_exact",
          "name": "GLP-1 CVOT Exact Replication",
          "reference": {
            "doi": "10.1111/dom.70121",
            "journal": "Diabetes, Obesity & Metabolism",
            "pmid": "40926380",
            "title": "Cardiovascular risk reduction with GLP-1 receptor agonists is proportional to HbA1c lowering in type 2 diabetes",
            "year": 2025
          },
          "sourcePath": "validation/reports/exact_replication_glp1/exact_replication_glp1_report.json",
          "summary": "11/11 checks passed against the bundled GLP-1 cardiovascular outcomes meta-analysis benchmark.",
          "tier": "exact",
          "verdict": "PASS"
        },
        "report_summary": {
          "k": 10,
          "total_n": 73263,
          "checks_passed": 11,
          "checks_total": 11,
          "all_passed": true,
          "verdict": "PASS"
        }
      }
    },
    {
      "category": "Cardiovascular Outcomes",
      "extraction": {
        "ctgov": {
          "has2x2": false,
          "hasReportedEffect": false,
          "hasResults": true,
          "matchScore": 63,
          "matchedOutcome": "Time to First Occurrence of Major Adverse Cardiovascular Events (MACE): Event Rate Per 100 Participant-years for First Occurrence of Major Cardiovascular (CV) Event - Non-Inferiority Analysis",
          "recordExtract": "Time to First Occurrence of Major Adverse Cardiovascular Events (MACE): Event Rate Per 100 Participant-years for First Occurrence of Major Cardiovascular (CV) Event - Non-Inferiority Analysis | Tx --/-- vs Ctrl --/--",
          "sampleNctId": "NCT03496298",
          "success": false
        },
        "pubmed": {
          "effectCount": 1,
          "firstExtract": "HR 1.14 [95% CI, 0.89-1.46]",
          "pmid": "41711744",
          "success": true,
          "title": "Semaglutide vs tirzepatide in patients with obesity and HFpEF: a report from a global federated research network."
        }
      },
      "failReasons": [
        "ctgov_extract"
      ],
      "name": "GLP-1 receptor agonists - CVOT - Oral semaglutide safety",
      "policy": {
        "allowedSources": [
          "ctgov",
          "pubmed",
          "openalex"
        ],
        "extractionMode": "pubmed-abstract-and-ctgov-records-only",
        "pass": true,
        "pdfUploadHidden": true,
        "pdfViewerHidden": true,
        "yearFloor": 2015
      },
      "screening": {
        "humanCheckable": true,
        "recordsWithAnchors": 1
      },
      "search": {
        "ctgov": {
          "anchorRecall": 0.125,
          "count": 16,
          "eligible": 8,
          "firstResult": {
            "nctId": "NCT05819138",
            "title": "Type 1 Diabetes Impacts of Semaglutide on Cardiovascular Outcomes",
            "year": "2023"
          },
          "matched": [
            "NCT02465515"
          ],
          "statusText": "CT.gov: kept 16 trials after applying the 2015+ floor"
        },
        "openalex": {
          "anchorRecall": 0.625,
          "count": 20,
          "eligible": 8,
          "firstResult": {
            "doi": "10.23736/s2724-6507.20.03219-8",
            "title": "Pancreatitis and pancreatic cancer in patients with type 2 diabetes treated with glucagon-like peptide-1 receptor agonists: an updated meta-analysis of randomized controlled trials",
            "year": "2023"
          },
          "matched": [
            "NCT01179048",
            "NCT01720446",
            "NCT01144338",
            "NCT01394952",
            "NCT03496298"
          ],
          "statusText": "OpenAlex: kept 20 records after applying the 2015+ floor"
        },
        "pubmed": {
          "anchorRecall": 0.25,
          "count": 20,
          "eligible": 8,
          "firstResult": {
            "doi": "10.59556/japi.74.1375",
            "pmid": "41818087",
            "title": "National Consensus on Semaglutide in Cardiology: From Clinical Evidence to Clinical Translation.",
            "year": "2026"
          },
          "matched": [
            "NCT01720446",
            "NCT02692716"
          ],
          "statusText": "1429 total results (PubMed: 20)"
        }
      },
      "status": "warn",
      "topicId": "glp1_cvot_oral",
      "validationPackId": "glp1_cvot_exact",
      "id": "glp1_cvot_oral",
      "pack": {
        "id": "glp1_cvot_exact",
        "meta": {
          "counts": {
            "checksPassed": 11,
            "checksTotal": 11,
            "k": 10,
            "totalN": 73263
          },
          "date": "2026-02-27",
          "id": "glp1_cvot_exact",
          "name": "GLP-1 CVOT Exact Replication",
          "reference": {
            "doi": "10.1111/dom.70121",
            "journal": "Diabetes, Obesity & Metabolism",
            "pmid": "40926380",
            "title": "Cardiovascular risk reduction with GLP-1 receptor agonists is proportional to HbA1c lowering in type 2 diabetes",
            "year": 2025
          },
          "sourcePath": "validation/reports/exact_replication_glp1/exact_replication_glp1_report.json",
          "summary": "11/11 checks passed against the bundled GLP-1 cardiovascular outcomes meta-analysis benchmark.",
          "tier": "exact",
          "verdict": "PASS"
        },
        "report_summary": {
          "k": 10,
          "total_n": 73263,
          "checks_passed": 11,
          "checks_total": 11,
          "all_passed": true,
          "verdict": "PASS"
        }
      }
    },
    {
      "category": "Atherosclerosis and Inflammation",
      "extraction": {
        "ctgov": {
          "has2x2": false,
          "hasReportedEffect": false,
          "hasResults": false,
          "matchScore": 45,
          "matchedOutcome": "First Event of Cardiovascular Death, Resuscitated Cardiac Arrest, Acute Myocardial Infarction, Stroke, or Urgent Hospitalization for Angina Requiring Coronary Revascularization",
          "recordExtract": "First Event of Cardiovascular Death, Resuscitated Cardiac Arrest, Acute Myocardial Infarction, Stroke, or Urgent Hospitalization for Angina Requiring Coronary Revascularization | Tx --/-- vs Ctrl --/--",
          "sampleNctId": "NCT02898610",
          "success": false
        },
        "pubmed": {
          "effectCount": 1,
          "firstExtract": "RR, 0.83 [95% CI, 0.66-1.04]",
          "pmid": "41568554",
          "success": true,
          "title": "Colchicine in Patients With Recent Myocardial Infarction: A Systematic Review and Meta-Analysis of Randomized Controlled Trials."
        }
      },
      "failReasons": [
        "ctgov_extract"
      ],
      "name": "Colchicine - Cardiovascular prevention - MACE",
      "policy": {
        "allowedSources": [
          "ctgov",
          "pubmed",
          "openalex"
        ],
        "extractionMode": "pubmed-abstract-and-ctgov-records-only",
        "pass": true,
        "pdfUploadHidden": true,
        "pdfViewerHidden": true,
        "yearFloor": 2015
      },
      "screening": {
        "humanCheckable": true,
        "recordsWithAnchors": 1
      },
      "search": {
        "ctgov": {
          "anchorRecall": 0.3333333333333333,
          "count": 18,
          "eligible": 3,
          "firstResult": {
            "nctId": "NCT05250596",
            "title": "On-admission Low-dose Colchicine in Addition to Atorvastatin to Reduce Inflammation in Acute Coronary Syndrome",
            "year": "2022"
          },
          "matched": [
            "NCT02551094"
          ],
          "statusText": "CT.gov: kept 18 trials after applying the 2015+ floor"
        },
        "openalex": {
          "anchorRecall": 1,
          "count": 20,
          "eligible": 5,
          "firstResult": {
            "doi": "10.1155/2024/8646351",
            "nctId": "NCT03048825",
            "pmid": "38505729",
            "title": "Meta-Analysis of Randomized Trials: Efficacy and Safety of Colchicine for Secondary Prevention of Cardiovascular Disease",
            "year": "2024"
          },
          "matched": [
            "NCT02551094",
            "LODOCO2",
            "COPS",
            "NCT03048825",
            "NCT02898610"
          ],
          "statusText": "OpenAlex: kept 20 records after applying the 2015+ floor"
        },
        "pubmed": {
          "anchorRecall": 0.4,
          "count": 20,
          "eligible": 5,
          "firstResult": {
            "doi": "10.1002/bcp.70523",
            "pmid": "41830179",
            "title": "Efficacy of low-dose colchicine on left ventricular hypertrophy in patients with coronary artery disease: A randomized controlled trial.",
            "year": "2026"
          },
          "matched": [
            "NCT02551094",
            "LODOCO2"
          ],
          "statusText": "1487 total results (PubMed: 20)"
        }
      },
      "status": "warn",
      "topicId": "colchicine_cvd_mace",
      "validationPackId": "colchicine_cvd_exact",
      "id": "colchicine_cvd_mace",
      "pack": {
        "id": "colchicine_cvd_exact",
        "meta": {
          "counts": {
            "checksPassed": 8,
            "checksTotal": 8,
            "k": 6,
            "totalN": 21800
          },
          "date": "2026-02-27",
          "id": "colchicine_cvd_exact",
          "name": "Colchicine CVD Exact Replication",
          "reference": {
            "doi": "10.1093/eurheartj/ehaf174",
            "journal": "European Heart Journal",
            "pmid": "40314333",
            "title": "Long-term trials of colchicine for secondary prevention of vascular events: a meta-analysis",
            "year": 2025
          },
          "sourcePath": "validation/reports/exact_replication_colchicine/exact_replication_colchicine_report.json",
          "summary": "8/8 checks passed against the bundled colchicine vascular events meta-analysis benchmark.",
          "tier": "exact",
          "verdict": "PASS"
        },
        "report_summary": {
          "k": 6,
          "total_n": 21800,
          "checks_passed": 8,
          "checks_total": 8,
          "all_passed": true,
          "verdict": "PASS"
        }
      }
    },
    {
      "category": "Atherosclerosis and Inflammation",
      "extraction": {
        "ctgov": {
          "has2x2": false,
          "hasReportedEffect": false,
          "hasResults": false,
          "matchScore": 57,
          "matchedOutcome": "First Event of Cardiovascular Death, Resuscitated Cardiac Arrest, Acute Myocardial Infarction, Stroke, or Urgent Hospitalization for Angina Requiring Coronary Revascularization",
          "recordExtract": "First Event of Cardiovascular Death, Resuscitated Cardiac Arrest, Acute Myocardial Infarction, Stroke, or Urgent Hospitalization for Angina Requiring Coronary Revascularization | Tx --/-- vs Ctrl --/--",
          "sampleNctId": "NCT02898610",
          "success": false
        },
        "pubmed": {
          "effectCount": 1,
          "firstExtract": "RR, 0.83 [95% CI, 0.66-1.04]",
          "pmid": "41568554",
          "success": true,
          "title": "Colchicine in Patients With Recent Myocardial Infarction: A Systematic Review and Meta-Analysis of Randomized Controlled Trials."
        }
      },
      "failReasons": [
        "ctgov_extract"
      ],
      "name": "Colchicine - Cardiovascular prevention - Recent MI",
      "policy": {
        "allowedSources": [
          "ctgov",
          "pubmed",
          "openalex"
        ],
        "extractionMode": "pubmed-abstract-and-ctgov-records-only",
        "pass": true,
        "pdfUploadHidden": true,
        "pdfViewerHidden": true,
        "yearFloor": 2015
      },
      "screening": {
        "humanCheckable": true,
        "recordsWithAnchors": 1
      },
      "search": {
        "ctgov": {
          "anchorRecall": 0.3333333333333333,
          "count": 18,
          "eligible": 3,
          "firstResult": {
            "nctId": "NCT05250596",
            "title": "On-admission Low-dose Colchicine in Addition to Atorvastatin to Reduce Inflammation in Acute Coronary Syndrome",
            "year": "2022"
          },
          "matched": [
            "NCT02551094"
          ],
          "statusText": "CT.gov: kept 18 trials after applying the 2015+ floor"
        },
        "openalex": {
          "anchorRecall": 1,
          "count": 20,
          "eligible": 5,
          "firstResult": {
            "doi": "10.1155/2024/8646351",
            "nctId": "NCT03048825",
            "pmid": "38505729",
            "title": "Meta-Analysis of Randomized Trials: Efficacy and Safety of Colchicine for Secondary Prevention of Cardiovascular Disease",
            "year": "2024"
          },
          "matched": [
            "NCT02551094",
            "LODOCO2",
            "COPS",
            "NCT03048825",
            "NCT02898610"
          ],
          "statusText": "OpenAlex: kept 20 records after applying the 2015+ floor"
        },
        "pubmed": {
          "anchorRecall": 0.4,
          "count": 20,
          "eligible": 5,
          "firstResult": {
            "doi": "10.1002/bcp.70523",
            "pmid": "41830179",
            "title": "Efficacy of low-dose colchicine on left ventricular hypertrophy in patients with coronary artery disease: A randomized controlled trial.",
            "year": "2026"
          },
          "matched": [
            "NCT02551094",
            "LODOCO2"
          ],
          "statusText": "1545 total results (PubMed: 20)"
        }
      },
      "status": "warn",
      "topicId": "colchicine_cvd_postmi",
      "validationPackId": "colchicine_cvd_exact",
      "id": "colchicine_cvd_postmi",
      "pack": {
        "id": "colchicine_cvd_exact",
        "meta": {
          "counts": {
            "checksPassed": 8,
            "checksTotal": 8,
            "k": 6,
            "totalN": 21800
          },
          "date": "2026-02-27",
          "id": "colchicine_cvd_exact",
          "name": "Colchicine CVD Exact Replication",
          "reference": {
            "doi": "10.1093/eurheartj/ehaf174",
            "journal": "European Heart Journal",
            "pmid": "40314333",
            "title": "Long-term trials of colchicine for secondary prevention of vascular events: a meta-analysis",
            "year": 2025
          },
          "sourcePath": "validation/reports/exact_replication_colchicine/exact_replication_colchicine_report.json",
          "summary": "8/8 checks passed against the bundled colchicine vascular events meta-analysis benchmark.",
          "tier": "exact",
          "verdict": "PASS"
        },
        "report_summary": {
          "k": 6,
          "total_n": 21800,
          "checks_passed": 8,
          "checks_total": 8,
          "all_passed": true,
          "verdict": "PASS"
        }
      }
    },
    {
      "category": "Atherosclerosis and Inflammation",
      "extraction": {
        "ctgov": {
          "has2x2": false,
          "hasReportedEffect": false,
          "hasResults": false,
          "matchScore": 27,
          "matchedOutcome": "First Event of Cardiovascular Death, Resuscitated Cardiac Arrest, Acute Myocardial Infarction, Stroke, or Urgent Hospitalization for Angina Requiring Coronary Revascularization",
          "recordExtract": "First Event of Cardiovascular Death, Resuscitated Cardiac Arrest, Acute Myocardial Infarction, Stroke, or Urgent Hospitalization for Angina Requiring Coronary Revascularization | Tx --/-- vs Ctrl --/--",
          "sampleNctId": "NCT02898610",
          "success": false
        },
        "pubmed": {
          "effectCount": 1,
          "firstExtract": "RR, 0.83 [95% CI, 0.66-1.04]",
          "pmid": "41568554",
          "success": true,
          "title": "Colchicine in Patients With Recent Myocardial Infarction: A Systematic Review and Meta-Analysis of Randomized Controlled Trials."
        }
      },
      "failReasons": [
        "ctgov_extract"
      ],
      "name": "Colchicine - Cardiovascular prevention - Chronic CAD",
      "policy": {
        "allowedSources": [
          "ctgov",
          "pubmed",
          "openalex"
        ],
        "extractionMode": "pubmed-abstract-and-ctgov-records-only",
        "pass": true,
        "pdfUploadHidden": true,
        "pdfViewerHidden": true,
        "yearFloor": 2015
      },
      "screening": {
        "humanCheckable": true,
        "recordsWithAnchors": 1
      },
      "search": {
        "ctgov": {
          "anchorRecall": 0.3333333333333333,
          "count": 18,
          "eligible": 3,
          "firstResult": {
            "nctId": "NCT05250596",
            "title": "On-admission Low-dose Colchicine in Addition to Atorvastatin to Reduce Inflammation in Acute Coronary Syndrome",
            "year": "2022"
          },
          "matched": [
            "NCT02551094"
          ],
          "statusText": "CT.gov: kept 18 trials after applying the 2015+ floor"
        },
        "openalex": {
          "anchorRecall": 1,
          "count": 20,
          "eligible": 5,
          "firstResult": {
            "doi": "10.1155/2024/8646351",
            "nctId": "NCT03048825",
            "pmid": "38505729",
            "title": "Meta-Analysis of Randomized Trials: Efficacy and Safety of Colchicine for Secondary Prevention of Cardiovascular Disease",
            "year": "2024"
          },
          "matched": [
            "NCT02551094",
            "LODOCO2",
            "COPS",
            "NCT03048825",
            "NCT02898610"
          ],
          "statusText": "OpenAlex: kept 20 records after applying the 2015+ floor"
        },
        "pubmed": {
          "anchorRecall": 0.4,
          "count": 20,
          "eligible": 5,
          "firstResult": {
            "doi": "10.1002/bcp.70523",
            "pmid": "41830179",
            "title": "Efficacy of low-dose colchicine on left ventricular hypertrophy in patients with coronary artery disease: A randomized controlled trial.",
            "year": "2026"
          },
          "matched": [
            "NCT02551094",
            "LODOCO2"
          ],
          "statusText": "1603 total results (PubMed: 20)"
        }
      },
      "status": "warn",
      "topicId": "colchicine_cvd_cad",
      "validationPackId": "colchicine_cvd_exact",
      "id": "colchicine_cvd_cad",
      "pack": {
        "id": "colchicine_cvd_exact",
        "meta": {
          "counts": {
            "checksPassed": 8,
            "checksTotal": 8,
            "k": 6,
            "totalN": 21800
          },
          "date": "2026-02-27",
          "id": "colchicine_cvd_exact",
          "name": "Colchicine CVD Exact Replication",
          "reference": {
            "doi": "10.1093/eurheartj/ehaf174",
            "journal": "European Heart Journal",
            "pmid": "40314333",
            "title": "Long-term trials of colchicine for secondary prevention of vascular events: a meta-analysis",
            "year": 2025
          },
          "sourcePath": "validation/reports/exact_replication_colchicine/exact_replication_colchicine_report.json",
          "summary": "8/8 checks passed against the bundled colchicine vascular events meta-analysis benchmark.",
          "tier": "exact",
          "verdict": "PASS"
        },
        "report_summary": {
          "k": 6,
          "total_n": 21800,
          "checks_passed": 8,
          "checks_total": 8,
          "all_passed": true,
          "verdict": "PASS"
        }
      }
    },
    {
      "category": "Atherosclerosis and Inflammation",
      "extraction": {
        "ctgov": {
          "has2x2": false,
          "hasReportedEffect": false,
          "hasResults": false,
          "matchScore": 45,
          "matchedOutcome": "First Event of Cardiovascular Death, Resuscitated Cardiac Arrest, Acute Myocardial Infarction, Stroke, or Urgent Hospitalization for Angina Requiring Coronary Revascularization",
          "recordExtract": "First Event of Cardiovascular Death, Resuscitated Cardiac Arrest, Acute Myocardial Infarction, Stroke, or Urgent Hospitalization for Angina Requiring Coronary Revascularization | Tx --/-- vs Ctrl --/--",
          "sampleNctId": "NCT02898610",
          "success": false
        },
        "pubmed": {
          "effectCount": 1,
          "firstExtract": "RR, 0.83 [95% CI, 0.66-1.04]",
          "pmid": "41568554",
          "success": true,
          "title": "Colchicine in Patients With Recent Myocardial Infarction: A Systematic Review and Meta-Analysis of Randomized Controlled Trials."
        }
      },
      "failReasons": [
        "ctgov_extract"
      ],
      "name": "Colchicine - Cardiovascular prevention - Stroke/TIA",
      "policy": {
        "allowedSources": [
          "ctgov",
          "pubmed",
          "openalex"
        ],
        "extractionMode": "pubmed-abstract-and-ctgov-records-only",
        "pass": true,
        "pdfUploadHidden": true,
        "pdfViewerHidden": true,
        "yearFloor": 2015
      },
      "screening": {
        "humanCheckable": true,
        "recordsWithAnchors": 1
      },
      "search": {
        "ctgov": {
          "anchorRecall": 0.3333333333333333,
          "count": 18,
          "eligible": 3,
          "firstResult": {
            "nctId": "NCT05250596",
            "title": "On-admission Low-dose Colchicine in Addition to Atorvastatin to Reduce Inflammation in Acute Coronary Syndrome",
            "year": "2022"
          },
          "matched": [
            "NCT02551094"
          ],
          "statusText": "CT.gov: kept 18 trials after applying the 2015+ floor"
        },
        "openalex": {
          "anchorRecall": 1,
          "count": 20,
          "eligible": 5,
          "firstResult": {
            "doi": "10.1155/2024/8646351",
            "nctId": "NCT03048825",
            "pmid": "38505729",
            "title": "Meta-Analysis of Randomized Trials: Efficacy and Safety of Colchicine for Secondary Prevention of Cardiovascular Disease",
            "year": "2024"
          },
          "matched": [
            "NCT02551094",
            "LODOCO2",
            "COPS",
            "NCT03048825",
            "NCT02898610"
          ],
          "statusText": "OpenAlex: kept 20 records after applying the 2015+ floor"
        },
        "pubmed": {
          "anchorRecall": 0.4,
          "count": 20,
          "eligible": 5,
          "firstResult": {
            "doi": "10.1002/bcp.70523",
            "pmid": "41830179",
            "title": "Efficacy of low-dose colchicine on left ventricular hypertrophy in patients with coronary artery disease: A randomized controlled trial.",
            "year": "2026"
          },
          "matched": [
            "NCT02551094",
            "LODOCO2"
          ],
          "statusText": "1661 total results (PubMed: 20)"
        }
      },
      "status": "warn",
      "topicId": "colchicine_cvd_stroke",
      "validationPackId": "colchicine_cvd_exact",
      "id": "colchicine_cvd_stroke",
      "pack": {
        "id": "colchicine_cvd_exact",
        "meta": {
          "counts": {
            "checksPassed": 8,
            "checksTotal": 8,
            "k": 6,
            "totalN": 21800
          },
          "date": "2026-02-27",
          "id": "colchicine_cvd_exact",
          "name": "Colchicine CVD Exact Replication",
          "reference": {
            "doi": "10.1093/eurheartj/ehaf174",
            "journal": "European Heart Journal",
            "pmid": "40314333",
            "title": "Long-term trials of colchicine for secondary prevention of vascular events: a meta-analysis",
            "year": 2025
          },
          "sourcePath": "validation/reports/exact_replication_colchicine/exact_replication_colchicine_report.json",
          "summary": "8/8 checks passed against the bundled colchicine vascular events meta-analysis benchmark.",
          "tier": "exact",
          "verdict": "PASS"
        },
        "report_summary": {
          "k": 6,
          "total_n": 21800,
          "checks_passed": 8,
          "checks_total": 8,
          "all_passed": true,
          "verdict": "PASS"
        }
      }
    },
    {
      "category": "Lipids",
      "extraction": {
        "ctgov": {
          "has2x2": false,
          "hasReportedEffect": false,
          "hasResults": true,
          "matchScore": 15,
          "matchedOutcome": "Percentage Change in LDL-C From Baseline to Day 510",
          "recordExtract": "Percentage Change in LDL-C From Baseline to Day 510 | Tx --/-- vs Ctrl --/--",
          "sampleNctId": "NCT03400800",
          "success": false
        },
        "pubmed": {
          "effectCount": 2,
          "firstExtract": "HR: 1.11; 95% CI: 1.02-1.21",
          "pmid": "41369622",
          "success": true,
          "title": "Obesity-Associated Cardiovascular Risk and Benefit From PCSK9 Inhibition: A Prespecified Analysis From FOURIER."
        }
      },
      "failReasons": [
        "ctgov_anchor_recall",
        "ctgov_extract"
      ],
      "name": "PCSK9 pathway inhibitors - MACE",
      "policy": {
        "allowedSources": [
          "ctgov",
          "pubmed",
          "openalex"
        ],
        "extractionMode": "pubmed-abstract-and-ctgov-records-only",
        "pass": true,
        "pdfUploadHidden": true,
        "pdfViewerHidden": true,
        "yearFloor": 2015
      },
      "screening": {
        "humanCheckable": true,
        "recordsWithAnchors": 0
      },
      "search": {
        "ctgov": {
          "anchorRecall": 0,
          "count": 17,
          "eligible": 4,
          "firstResult": {
            "nctId": "NCT05639218",
            "title": "Impact of Optimal Pharmacotherapy on Plasma Lipid Profile and Qualitative Features of Atherosclerotic Plaques in Very-high Cardiovascular Risk Patients With Established Atherosclerotic Cardiovascular Disease",
            "year": "2021"
          },
          "matched": [],
          "statusText": "CT.gov: kept 17 trials after applying the 2015+ floor"
        },
        "openalex": {
          "anchorRecall": 0.5,
          "count": 20,
          "eligible": 4,
          "firstResult": {
            "doi": "10.1056/nejmoa1500858",
            "nctId": "NCT01439880",
            "title": "Efficacy and Safety of Evolocumab in Reducing Lipids and Cardiovascular Events",
            "year": "2015"
          },
          "matched": [
            "NCT01764633",
            "NCT01663402"
          ],
          "statusText": "OpenAlex: kept 20 records after applying the 2015+ floor"
        },
        "pubmed": {
          "anchorRecall": 1,
          "count": 20,
          "eligible": 4,
          "firstResult": {
            "doi": "10.1016/j.atherosclerosis.2026.120686",
            "pmid": "41806515",
            "title": "LDL subspecies and lipidome change by evolocumab add-on therapy to empagliflozin in patients with type 2 diabetes: A prespecified secondary analysis of a randomized clinical trial.",
            "year": "2026"
          },
          "matched": [
            "NCT01764633",
            "NCT01663402",
            "NCT03399370",
            "NCT03400800"
          ],
          "statusText": "1718 total results (PubMed: 20)"
        }
      },
      "status": "warn",
      "topicId": "pcsk9_mace",
      "validationPackId": "pairwise70_cardio",
      "id": "pcsk9_mace",
      "pack": {
        "id": "pairwise70_cardio",
        "meta": {
          "counts": {
            "error": 0,
            "fail": 0,
            "pass": 45,
            "passRate": 100,
            "prepared": 45
          },
          "date": "2026-02-27",
          "id": "pairwise70_cardio",
          "name": "Pairwise70 Cardio End-to-End",
          "sourcePath": "validation/reports/pairwise70_cardio_benchmark/pairwise70_cardio_end_to_end_report.json",
          "summary": "45/45 prepared cardiovascular datasets passed using ClinicalTrials.gov, PubMed, and OpenAlex only, with no PDF extraction pipeline.",
          "tier": "domain",
          "verdict": "PASS"
        },
        "report_summary": {
          "scope": {
            "domain": "cardiovascular",
            "design": "RCT-focused Pairwise70 Cochrane study-level",
            "sources": [
              "ClinicalTrials.gov",
              "AACT",
              "PubMed",
              "OpenAlex"
            ],
            "pdf_pipeline_used": false
          },
          "counts": {
            "cardio_review_ids": 52,
            "cardio_dataset_files": 47,
            "prepared_datasets": 45,
            "skipped_datasets": 2,
            "pass": 45,
            "fail": 0,
            "error": 0,
            "pass_rate": 100.0
          },
          "elapsed_seconds": 9.37
        }
      }
    },
    {
      "category": "Lipids",
      "extraction": {
        "ctgov": {
          "has2x2": false,
          "hasReportedEffect": false,
          "hasResults": true,
          "matchScore": 27,
          "matchedOutcome": "Time-adjusted Percent Change in LDL-C Levels From Baseline After Day 90 and up to Day 540",
          "recordExtract": "Time-adjusted Percent Change in LDL-C Levels From Baseline After Day 90 and up to Day 540 | Tx --/-- vs Ctrl --/--",
          "sampleNctId": "NCT03400800",
          "success": false
        },
        "pubmed": {
          "effectCount": 2,
          "firstExtract": "HR: 1.11; 95% CI: 1.02-1.21",
          "pmid": "41369622",
          "success": true,
          "title": "Obesity-Associated Cardiovascular Risk and Benefit From PCSK9 Inhibition: A Prespecified Analysis From FOURIER."
        }
      },
      "failReasons": [
        "ctgov_anchor_recall",
        "ctgov_extract"
      ],
      "name": "PCSK9 pathway inhibitors - ACS subgroup",
      "policy": {
        "allowedSources": [
          "ctgov",
          "pubmed",
          "openalex"
        ],
        "extractionMode": "pubmed-abstract-and-ctgov-records-only",
        "pass": true,
        "pdfUploadHidden": true,
        "pdfViewerHidden": true,
        "yearFloor": 2015
      },
      "screening": {
        "humanCheckable": true,
        "recordsWithAnchors": 0
      },
      "search": {
        "ctgov": {
          "anchorRecall": 0,
          "count": 17,
          "eligible": 4,
          "firstResult": {
            "nctId": "NCT05639218",
            "title": "Impact of Optimal Pharmacotherapy on Plasma Lipid Profile and Qualitative Features of Atherosclerotic Plaques in Very-high Cardiovascular Risk Patients With Established Atherosclerotic Cardiovascular Disease",
            "year": "2021"
          },
          "matched": [],
          "statusText": "CT.gov: kept 17 trials after applying the 2015+ floor"
        },
        "openalex": {
          "anchorRecall": 0.5,
          "count": 20,
          "eligible": 4,
          "firstResult": {
            "doi": "10.1056/nejmoa1500858",
            "nctId": "NCT01439880",
            "title": "Efficacy and Safety of Evolocumab in Reducing Lipids and Cardiovascular Events",
            "year": "2015"
          },
          "matched": [
            "NCT01764633",
            "NCT01663402"
          ],
          "statusText": "OpenAlex: kept 20 records after applying the 2015+ floor"
        },
        "pubmed": {
          "anchorRecall": 1,
          "count": 20,
          "eligible": 4,
          "firstResult": {
            "doi": "10.1016/j.atherosclerosis.2026.120686",
            "pmid": "41806515",
            "title": "LDL subspecies and lipidome change by evolocumab add-on therapy to empagliflozin in patients with type 2 diabetes: A prespecified secondary analysis of a randomized clinical trial.",
            "year": "2026"
          },
          "matched": [
            "NCT01764633",
            "NCT01663402",
            "NCT03399370",
            "NCT03400800"
          ],
          "statusText": "1775 total results (PubMed: 20)"
        }
      },
      "status": "warn",
      "topicId": "pcsk9_acs",
      "validationPackId": "pairwise70_cardio",
      "id": "pcsk9_acs",
      "pack": {
        "id": "pairwise70_cardio",
        "meta": {
          "counts": {
            "error": 0,
            "fail": 0,
            "pass": 45,
            "passRate": 100,
            "prepared": 45
          },
          "date": "2026-02-27",
          "id": "pairwise70_cardio",
          "name": "Pairwise70 Cardio End-to-End",
          "sourcePath": "validation/reports/pairwise70_cardio_benchmark/pairwise70_cardio_end_to_end_report.json",
          "summary": "45/45 prepared cardiovascular datasets passed using ClinicalTrials.gov, PubMed, and OpenAlex only, with no PDF extraction pipeline.",
          "tier": "domain",
          "verdict": "PASS"
        },
        "report_summary": {
          "scope": {
            "domain": "cardiovascular",
            "design": "RCT-focused Pairwise70 Cochrane study-level",
            "sources": [
              "ClinicalTrials.gov",
              "AACT",
              "PubMed",
              "OpenAlex"
            ],
            "pdf_pipeline_used": false
          },
          "counts": {
            "cardio_review_ids": 52,
            "cardio_dataset_files": 47,
            "prepared_datasets": 45,
            "skipped_datasets": 2,
            "pass": 45,
            "fail": 0,
            "error": 0,
            "pass_rate": 100.0
          },
          "elapsed_seconds": 9.37
        }
      }
    },
    {
      "category": "Lipids",
      "extraction": {
        "ctgov": {
          "has2x2": false,
          "hasReportedEffect": false,
          "hasResults": true,
          "matchScore": 39,
          "matchedOutcome": "Percentage Change in Total Cholesterol From Baseline to Day 510",
          "recordExtract": "Percentage Change in Total Cholesterol From Baseline to Day 510 | Tx --/-- vs Ctrl --/--",
          "sampleNctId": "NCT03400800",
          "success": false
        },
        "pubmed": {
          "effectCount": 2,
          "firstExtract": "HR: 1.11; 95% CI: 1.02-1.21",
          "pmid": "41369622",
          "success": true,
          "title": "Obesity-Associated Cardiovascular Risk and Benefit From PCSK9 Inhibition: A Prespecified Analysis From FOURIER."
        }
      },
      "failReasons": [
        "ctgov_anchor_recall",
        "ctgov_extract"
      ],
      "name": "PCSK9 pathway inhibitors - LDL-C reduction",
      "policy": {
        "allowedSources": [
          "ctgov",
          "pubmed",
          "openalex"
        ],
        "extractionMode": "pubmed-abstract-and-ctgov-records-only",
        "pass": true,
        "pdfUploadHidden": true,
        "pdfViewerHidden": true,
        "yearFloor": 2015
      },
      "screening": {
        "humanCheckable": true,
        "recordsWithAnchors": 0
      },
      "search": {
        "ctgov": {
          "anchorRecall": 0,
          "count": 17,
          "eligible": 4,
          "firstResult": {
            "nctId": "NCT05639218",
            "title": "Impact of Optimal Pharmacotherapy on Plasma Lipid Profile and Qualitative Features of Atherosclerotic Plaques in Very-high Cardiovascular Risk Patients With Established Atherosclerotic Cardiovascular Disease",
            "year": "2021"
          },
          "matched": [],
          "statusText": "CT.gov: kept 17 trials after applying the 2015+ floor"
        },
        "openalex": {
          "anchorRecall": 0.5,
          "count": 20,
          "eligible": 4,
          "firstResult": {
            "doi": "10.1056/nejmoa1500858",
            "nctId": "NCT01439880",
            "title": "Efficacy and Safety of Evolocumab in Reducing Lipids and Cardiovascular Events",
            "year": "2015"
          },
          "matched": [
            "NCT01764633",
            "NCT01663402"
          ],
          "statusText": "OpenAlex: kept 20 records after applying the 2015+ floor"
        },
        "pubmed": {
          "anchorRecall": 1,
          "count": 20,
          "eligible": 4,
          "firstResult": {
            "doi": "10.1016/j.atherosclerosis.2026.120686",
            "pmid": "41806515",
            "title": "LDL subspecies and lipidome change by evolocumab add-on therapy to empagliflozin in patients with type 2 diabetes: A prespecified secondary analysis of a randomized clinical trial.",
            "year": "2026"
          },
          "matched": [
            "NCT01764633",
            "NCT01663402",
            "NCT03399370",
            "NCT03400800"
          ],
          "statusText": "1832 total results (PubMed: 20)"
        }
      },
      "status": "warn",
      "topicId": "pcsk9_ldlc",
      "validationPackId": "pairwise70_cardio",
      "id": "pcsk9_ldlc",
      "pack": {
        "id": "pairwise70_cardio",
        "meta": {
          "counts": {
            "error": 0,
            "fail": 0,
            "pass": 45,
            "passRate": 100,
            "prepared": 45
          },
          "date": "2026-02-27",
          "id": "pairwise70_cardio",
          "name": "Pairwise70 Cardio End-to-End",
          "sourcePath": "validation/reports/pairwise70_cardio_benchmark/pairwise70_cardio_end_to_end_report.json",
          "summary": "45/45 prepared cardiovascular datasets passed using ClinicalTrials.gov, PubMed, and OpenAlex only, with no PDF extraction pipeline.",
          "tier": "domain",
          "verdict": "PASS"
        },
        "report_summary": {
          "scope": {
            "domain": "cardiovascular",
            "design": "RCT-focused Pairwise70 Cochrane study-level",
            "sources": [
              "ClinicalTrials.gov",
              "AACT",
              "PubMed",
              "OpenAlex"
            ],
            "pdf_pipeline_used": false
          },
          "counts": {
            "cardio_review_ids": 52,
            "cardio_dataset_files": 47,
            "prepared_datasets": 45,
            "skipped_datasets": 2,
            "pass": 45,
            "fail": 0,
            "error": 0,
            "pass_rate": 100.0
          },
          "elapsed_seconds": 9.37
        }
      }
    },
    {
      "category": "Lipids",
      "extraction": {
        "ctgov": {
          "has2x2": false,
          "hasReportedEffect": false,
          "hasResults": true,
          "matchScore": 27,
          "matchedOutcome": "Percentage Change in Total Cholesterol From Baseline to Day 510",
          "recordExtract": "Percentage Change in Total Cholesterol From Baseline to Day 510 | Tx --/-- vs Ctrl --/--",
          "sampleNctId": "NCT03400800",
          "success": false
        },
        "pubmed": {
          "effectCount": 2,
          "firstExtract": "HR: 1.11; 95% CI: 1.02-1.21",
          "pmid": "41369622",
          "success": true,
          "title": "Obesity-Associated Cardiovascular Risk and Benefit From PCSK9 Inhibition: A Prespecified Analysis From FOURIER."
        }
      },
      "failReasons": [
        "ctgov_anchor_recall",
        "ctgov_extract"
      ],
      "name": "PCSK9 pathway inhibitors - Inclisiran subgroup",
      "policy": {
        "allowedSources": [
          "ctgov",
          "pubmed",
          "openalex"
        ],
        "extractionMode": "pubmed-abstract-and-ctgov-records-only",
        "pass": true,
        "pdfUploadHidden": true,
        "pdfViewerHidden": true,
        "yearFloor": 2015
      },
      "screening": {
        "humanCheckable": true,
        "recordsWithAnchors": 0
      },
      "search": {
        "ctgov": {
          "anchorRecall": 0,
          "count": 17,
          "eligible": 4,
          "firstResult": {
            "nctId": "NCT05639218",
            "title": "Impact of Optimal Pharmacotherapy on Plasma Lipid Profile and Qualitative Features of Atherosclerotic Plaques in Very-high Cardiovascular Risk Patients With Established Atherosclerotic Cardiovascular Disease",
            "year": "2021"
          },
          "matched": [],
          "statusText": "CT.gov: kept 17 trials after applying the 2015+ floor"
        },
        "openalex": {
          "anchorRecall": 0.5,
          "count": 20,
          "eligible": 4,
          "firstResult": {
            "doi": "10.1056/nejmoa1500858",
            "nctId": "NCT01439880",
            "title": "Efficacy and Safety of Evolocumab in Reducing Lipids and Cardiovascular Events",
            "year": "2015"
          },
          "matched": [
            "NCT01764633",
            "NCT01663402"
          ],
          "statusText": "OpenAlex: kept 20 records after applying the 2015+ floor"
        },
        "pubmed": {
          "anchorRecall": 1,
          "count": 20,
          "eligible": 4,
          "firstResult": {
            "doi": "10.1016/j.atherosclerosis.2026.120686",
            "pmid": "41806515",
            "title": "LDL subspecies and lipidome change by evolocumab add-on therapy to empagliflozin in patients with type 2 diabetes: A prespecified secondary analysis of a randomized clinical trial.",
            "year": "2026"
          },
          "matched": [
            "NCT01764633",
            "NCT01663402",
            "NCT03399370",
            "NCT03400800"
          ],
          "statusText": "1889 total results (PubMed: 20)"
        }
      },
      "status": "warn",
      "topicId": "pcsk9_inclisiran",
      "validationPackId": "pairwise70_cardio",
      "id": "pcsk9_inclisiran",
      "pack": {
        "id": "pairwise70_cardio",
        "meta": {
          "counts": {
            "error": 0,
            "fail": 0,
            "pass": 45,
            "passRate": 100,
            "prepared": 45
          },
          "date": "2026-02-27",
          "id": "pairwise70_cardio",
          "name": "Pairwise70 Cardio End-to-End",
          "sourcePath": "validation/reports/pairwise70_cardio_benchmark/pairwise70_cardio_end_to_end_report.json",
          "summary": "45/45 prepared cardiovascular datasets passed using ClinicalTrials.gov, PubMed, and OpenAlex only, with no PDF extraction pipeline.",
          "tier": "domain",
          "verdict": "PASS"
        },
        "report_summary": {
          "scope": {
            "domain": "cardiovascular",
            "design": "RCT-focused Pairwise70 Cochrane study-level",
            "sources": [
              "ClinicalTrials.gov",
              "AACT",
              "PubMed",
              "OpenAlex"
            ],
            "pdf_pipeline_used": false
          },
          "counts": {
            "cardio_review_ids": 52,
            "cardio_dataset_files": 47,
            "prepared_datasets": 45,
            "skipped_datasets": 2,
            "pass": 45,
            "fail": 0,
            "error": 0,
            "pass_rate": 100.0
          },
          "elapsed_seconds": 9.37
        }
      }
    },
    {
      "category": "Lipids",
      "extraction": {
        "ctgov": {
          "has2x2": false,
          "hasReportedEffect": false,
          "hasResults": true,
          "matchScore": 98,
          "matchedOutcome": "Number of Participants With First Occurrence of Four Component Major Adverse Cardiovascular Events (MACE)",
          "recordExtract": "Number of Participants With First Occurrence of Four Component Major Adverse Cardiovascular Events (MACE) | Tx --/-- vs Ctrl --/--",
          "sampleNctId": "NCT02993406",
          "success": false
        },
        "pubmed": {
          "effectCount": 1,
          "firstExtract": "HR, 0.68 [95% CI, 0.53-0.86]",
          "pmid": "39921511",
          "success": true,
          "title": "Bempedoic Acid for Prevention of Cardiovascular Events in People With Obesity: A CLEAR Outcomes Subset Analysis."
        }
      },
      "failReasons": [
        "ctgov_extract"
      ],
      "name": "Bempedoic acid - MACE",
      "policy": {
        "allowedSources": [
          "ctgov",
          "pubmed",
          "openalex"
        ],
        "extractionMode": "pubmed-abstract-and-ctgov-records-only",
        "pass": true,
        "pdfUploadHidden": true,
        "pdfViewerHidden": true,
        "yearFloor": 2015
      },
      "screening": {
        "humanCheckable": true,
        "recordsWithAnchors": 2
      },
      "search": {
        "ctgov": {
          "anchorRecall": 0.5,
          "count": 17,
          "eligible": 4,
          "firstResult": {
            "nctId": "NCT07255820",
            "title": "Comparative Efficacy and Safety of Dual Versus Triple Lipid-Lowering Therapies (Rosuvastatin/Ezetimibe, Bempedoic Acid/Ezetimibe, and Rosuvastatin/Ezetimibe/Bempedoic Acid ) in Type 2 Diabetes Mellitus Patients With Elevated LDL Cholesterol",
            "year": "2026"
          },
          "matched": [
            "NCT02988115",
            "NCT02993406"
          ],
          "statusText": "CT.gov: kept 17 trials after applying the 2015+ floor"
        },
        "openalex": {
          "anchorRecall": 0.5,
          "count": 20,
          "eligible": 4,
          "firstResult": {
            "doi": "10.1161/jaha.118.011662",
            "pmid": "30922146",
            "title": "Efficacy and Safety of Bempedoic Acid in Patients With Hypercholesterolemia and Statin Intolerance",
            "year": "2019"
          },
          "matched": [
            "NCT02991118",
            "NCT02993406"
          ],
          "statusText": "OpenAlex: kept 20 records after applying the 2015+ floor"
        },
        "pubmed": {
          "anchorRecall": 0.25,
          "count": 19,
          "eligible": 4,
          "firstResult": {
            "doi": "10.1016/j.ajpc.2026.101417",
            "pmid": "41624043",
            "title": "Progress in risk assessment and management: Forecasting updates across international cholesterol guidelines.",
            "year": "2026"
          },
          "matched": [
            "NCT02993406"
          ],
          "statusText": "1945 total results (PubMed: 19)"
        }
      },
      "status": "warn",
      "topicId": "bempedoic_mace",
      "validationPackId": "pairwise70_cardio",
      "id": "bempedoic_mace",
      "pack": {
        "id": "pairwise70_cardio",
        "meta": {
          "counts": {
            "error": 0,
            "fail": 0,
            "pass": 45,
            "passRate": 100,
            "prepared": 45
          },
          "date": "2026-02-27",
          "id": "pairwise70_cardio",
          "name": "Pairwise70 Cardio End-to-End",
          "sourcePath": "validation/reports/pairwise70_cardio_benchmark/pairwise70_cardio_end_to_end_report.json",
          "summary": "45/45 prepared cardiovascular datasets passed using ClinicalTrials.gov, PubMed, and OpenAlex only, with no PDF extraction pipeline.",
          "tier": "domain",
          "verdict": "PASS"
        },
        "report_summary": {
          "scope": {
            "domain": "cardiovascular",
            "design": "RCT-focused Pairwise70 Cochrane study-level",
            "sources": [
              "ClinicalTrials.gov",
              "AACT",
              "PubMed",
              "OpenAlex"
            ],
            "pdf_pipeline_used": false
          },
          "counts": {
            "cardio_review_ids": 52,
            "cardio_dataset_files": 47,
            "prepared_datasets": 45,
            "skipped_datasets": 2,
            "pass": 45,
            "fail": 0,
            "error": 0,
            "pass_rate": 100.0
          },
          "elapsed_seconds": 9.37
        }
      }
    },
    {
      "category": "Lipids",
      "extraction": {
        "ctgov": {
          "has2x2": false,
          "hasReportedEffect": false,
          "hasResults": true,
          "matchScore": 15,
          "matchedOutcome": "Number of Participants With First Occurrence of Four Component Major Adverse Cardiovascular Events (MACE)",
          "recordExtract": "Number of Participants With First Occurrence of Four Component Major Adverse Cardiovascular Events (MACE) | Tx --/-- vs Ctrl --/--",
          "sampleNctId": "NCT02993406",
          "success": false
        },
        "pubmed": {
          "effectCount": 1,
          "firstExtract": "HR, 0.68 [95% CI, 0.53-0.86]",
          "pmid": "39921511",
          "success": true,
          "title": "Bempedoic Acid for Prevention of Cardiovascular Events in People With Obesity: A CLEAR Outcomes Subset Analysis."
        }
      },
      "failReasons": [
        "ctgov_extract"
      ],
      "name": "Bempedoic acid - LDL-C reduction",
      "policy": {
        "allowedSources": [
          "ctgov",
          "pubmed",
          "openalex"
        ],
        "extractionMode": "pubmed-abstract-and-ctgov-records-only",
        "pass": true,
        "pdfUploadHidden": true,
        "pdfViewerHidden": true,
        "yearFloor": 2015
      },
      "screening": {
        "humanCheckable": true,
        "recordsWithAnchors": 2
      },
      "search": {
        "ctgov": {
          "anchorRecall": 0.5,
          "count": 17,
          "eligible": 4,
          "firstResult": {
            "nctId": "NCT07255820",
            "title": "Comparative Efficacy and Safety of Dual Versus Triple Lipid-Lowering Therapies (Rosuvastatin/Ezetimibe, Bempedoic Acid/Ezetimibe, and Rosuvastatin/Ezetimibe/Bempedoic Acid ) in Type 2 Diabetes Mellitus Patients With Elevated LDL Cholesterol",
            "year": "2026"
          },
          "matched": [
            "NCT02988115",
            "NCT02993406"
          ],
          "statusText": "CT.gov: kept 17 trials after applying the 2015+ floor"
        },
        "openalex": {
          "anchorRecall": 0.5,
          "count": 20,
          "eligible": 4,
          "firstResult": {
            "doi": "10.1161/jaha.118.011662",
            "pmid": "30922146",
            "title": "Efficacy and Safety of Bempedoic Acid in Patients With Hypercholesterolemia and Statin Intolerance",
            "year": "2019"
          },
          "matched": [
            "NCT02991118",
            "NCT02993406"
          ],
          "statusText": "OpenAlex: kept 20 records after applying the 2015+ floor"
        },
        "pubmed": {
          "anchorRecall": 0.25,
          "count": 19,
          "eligible": 4,
          "firstResult": {
            "doi": "10.1016/j.ajpc.2026.101417",
            "pmid": "41624043",
            "title": "Progress in risk assessment and management: Forecasting updates across international cholesterol guidelines.",
            "year": "2026"
          },
          "matched": [
            "NCT02993406"
          ],
          "statusText": "2001 total results (PubMed: 19)"
        }
      },
      "status": "warn",
      "topicId": "bempedoic_ldlc",
      "validationPackId": "pairwise70_cardio",
      "id": "bempedoic_ldlc",
      "pack": {
        "id": "pairwise70_cardio",
        "meta": {
          "counts": {
            "error": 0,
            "fail": 0,
            "pass": 45,
            "passRate": 100,
            "prepared": 45
          },
          "date": "2026-02-27",
          "id": "pairwise70_cardio",
          "name": "Pairwise70 Cardio End-to-End",
          "sourcePath": "validation/reports/pairwise70_cardio_benchmark/pairwise70_cardio_end_to_end_report.json",
          "summary": "45/45 prepared cardiovascular datasets passed using ClinicalTrials.gov, PubMed, and OpenAlex only, with no PDF extraction pipeline.",
          "tier": "domain",
          "verdict": "PASS"
        },
        "report_summary": {
          "scope": {
            "domain": "cardiovascular",
            "design": "RCT-focused Pairwise70 Cochrane study-level",
            "sources": [
              "ClinicalTrials.gov",
              "AACT",
              "PubMed",
              "OpenAlex"
            ],
            "pdf_pipeline_used": false
          },
          "counts": {
            "cardio_review_ids": 52,
            "cardio_dataset_files": 47,
            "prepared_datasets": 45,
            "skipped_datasets": 2,
            "pass": 45,
            "fail": 0,
            "error": 0,
            "pass_rate": 100.0
          },
          "elapsed_seconds": 9.37
        }
      }
    },
    {
      "category": "Lipids",
      "extraction": {
        "ctgov": {
          "has2x2": false,
          "hasReportedEffect": false,
          "hasResults": true,
          "matchScore": 27,
          "matchedOutcome": "Number of Participants With First Occurrence of Four Component Major Adverse Cardiovascular Events (MACE)",
          "recordExtract": "Number of Participants With First Occurrence of Four Component Major Adverse Cardiovascular Events (MACE) | Tx --/-- vs Ctrl --/--",
          "sampleNctId": "NCT02993406",
          "success": false
        },
        "pubmed": {
          "effectCount": 1,
          "firstExtract": "HR, 0.68 [95% CI, 0.53-0.86]",
          "pmid": "39921511",
          "success": true,
          "title": "Bempedoic Acid for Prevention of Cardiovascular Events in People With Obesity: A CLEAR Outcomes Subset Analysis."
        }
      },
      "failReasons": [
        "ctgov_extract"
      ],
      "name": "Bempedoic acid - Statin-intolerant subgroup",
      "policy": {
        "allowedSources": [
          "ctgov",
          "pubmed",
          "openalex"
        ],
        "extractionMode": "pubmed-abstract-and-ctgov-records-only",
        "pass": true,
        "pdfUploadHidden": true,
        "pdfViewerHidden": true,
        "yearFloor": 2015
      },
      "screening": {
        "humanCheckable": true,
        "recordsWithAnchors": 2
      },
      "search": {
        "ctgov": {
          "anchorRecall": 0.5,
          "count": 17,
          "eligible": 4,
          "firstResult": {
            "nctId": "NCT07255820",
            "title": "Comparative Efficacy and Safety of Dual Versus Triple Lipid-Lowering Therapies (Rosuvastatin/Ezetimibe, Bempedoic Acid/Ezetimibe, and Rosuvastatin/Ezetimibe/Bempedoic Acid ) in Type 2 Diabetes Mellitus Patients With Elevated LDL Cholesterol",
            "year": "2026"
          },
          "matched": [
            "NCT02988115",
            "NCT02993406"
          ],
          "statusText": "CT.gov: kept 17 trials after applying the 2015+ floor"
        },
        "openalex": {
          "anchorRecall": 0.5,
          "count": 20,
          "eligible": 4,
          "firstResult": {
            "doi": "10.1161/jaha.118.011662",
            "pmid": "30922146",
            "title": "Efficacy and Safety of Bempedoic Acid in Patients With Hypercholesterolemia and Statin Intolerance",
            "year": "2019"
          },
          "matched": [
            "NCT02991118",
            "NCT02993406"
          ],
          "statusText": "OpenAlex: kept 20 records after applying the 2015+ floor"
        },
        "pubmed": {
          "anchorRecall": 0.25,
          "count": 19,
          "eligible": 4,
          "firstResult": {
            "doi": "10.1016/j.ajpc.2026.101417",
            "pmid": "41624043",
            "title": "Progress in risk assessment and management: Forecasting updates across international cholesterol guidelines.",
            "year": "2026"
          },
          "matched": [
            "NCT02993406"
          ],
          "statusText": "2057 total results (PubMed: 19)"
        }
      },
      "status": "warn",
      "topicId": "bempedoic_statin_intolerance",
      "validationPackId": "pairwise70_cardio",
      "id": "bempedoic_statin_intolerance",
      "pack": {
        "id": "pairwise70_cardio",
        "meta": {
          "counts": {
            "error": 0,
            "fail": 0,
            "pass": 45,
            "passRate": 100,
            "prepared": 45
          },
          "date": "2026-02-27",
          "id": "pairwise70_cardio",
          "name": "Pairwise70 Cardio End-to-End",
          "sourcePath": "validation/reports/pairwise70_cardio_benchmark/pairwise70_cardio_end_to_end_report.json",
          "summary": "45/45 prepared cardiovascular datasets passed using ClinicalTrials.gov, PubMed, and OpenAlex only, with no PDF extraction pipeline.",
          "tier": "domain",
          "verdict": "PASS"
        },
        "report_summary": {
          "scope": {
            "domain": "cardiovascular",
            "design": "RCT-focused Pairwise70 Cochrane study-level",
            "sources": [
              "ClinicalTrials.gov",
              "AACT",
              "PubMed",
              "OpenAlex"
            ],
            "pdf_pipeline_used": false
          },
          "counts": {
            "cardio_review_ids": 52,
            "cardio_dataset_files": 47,
            "prepared_datasets": 45,
            "skipped_datasets": 2,
            "pass": 45,
            "fail": 0,
            "error": 0,
            "pass_rate": 100.0
          },
          "elapsed_seconds": 9.37
        }
      }
    },
    {
      "category": "Hypertension",
      "extraction": {
        "ctgov": {
          "has2x2": false,
          "hasReportedEffect": false,
          "hasResults": false,
          "matchScore": 33,
          "matchedOutcome": "Number of Participants With First Occurrence of a Myocardial Infarction (MI), Acute Coronary Syndrome (ACS), Stroke, Heart Failure (HF), or CVD Death",
          "recordExtract": "Number of Participants With First Occurrence of a Myocardial Infarction (MI), Acute Coronary Syndrome (ACS), Stroke, Heart Failure (HF), or CVD Death | Tx --/-- vs Ctrl --/--",
          "sampleNctId": "NCT04993924",
          "success": false
        },
        "pubmed": {
          "effectCount": 1,
          "firstExtract": "rate ratio 0.93 (95% CI 0.81 to 1.05",
          "pmid": "41365607",
          "success": true,
          "title": "Association of blood pressure control with atrial and ventricular ectopy in SPRINT."
        }
      },
      "failReasons": [
        "ctgov_anchor_recall",
        "ctgov_extract"
      ],
      "name": "Intensive blood pressure targets - MACE",
      "policy": {
        "allowedSources": [
          "ctgov",
          "pubmed",
          "openalex"
        ],
        "extractionMode": "pubmed-abstract-and-ctgov-records-only",
        "pass": true,
        "pdfUploadHidden": true,
        "pdfViewerHidden": true,
        "yearFloor": 2015
      },
      "screening": {
        "humanCheckable": true,
        "recordsWithAnchors": 0
      },
      "search": {
        "ctgov": {
          "anchorRecall": 0,
          "count": 14,
          "eligible": 3,
          "firstResult": {
            "nctId": "NCT06431178",
            "title": "A Comparative Study Between General Anesthesia Versus Sedation By Dexmedetomidine and Ketamine With Local Infiltration for Percutaneous Transcatheter Closure of Atrial Septal Defect in Pediatric Patients",
            "year": "2024"
          },
          "matched": [],
          "statusText": "CT.gov: kept 14 trials after applying the 2015+ floor"
        },
        "openalex": {
          "anchorRecall": 0.6666666666666666,
          "count": 20,
          "eligible": 3,
          "firstResult": {
            "doi": "10.1159/000455130",
            "pmid": "28161697",
            "title": "In the Wake of Systolic Blood Pressure Intervention Trial: New Targets for Improving Hypertension Management in Chronic Kidney Disease?",
            "year": "2017"
          },
          "matched": [
            "NCT01206062",
            "NCT03015311"
          ],
          "statusText": "OpenAlex: kept 20 records after applying the 2015+ floor"
        },
        "pubmed": {
          "anchorRecall": 1,
          "count": 20,
          "eligible": 3,
          "firstResult": {
            "doi": "10.1186/s12916-026-04678-2",
            "nctId": "NCT03527719",
            "pmid": "41776553",
            "title": "Cardiovascular outcomes of intensive blood pressure control in patients with and without metabolic dysfunction-associated fatty liver disease: post hoc analysis of the CRHCP trial.",
            "year": "2026"
          },
          "matched": [
            "NCT01206062",
            "NCT03015311",
            "NCT04993924"
          ],
          "statusText": "2111 total results (PubMed: 20)"
        }
      },
      "status": "warn",
      "topicId": "intensive_bp_mace",
      "validationPackId": "pairwise70_cardio",
      "id": "intensive_bp_mace",
      "pack": {
        "id": "pairwise70_cardio",
        "meta": {
          "counts": {
            "error": 0,
            "fail": 0,
            "pass": 45,
            "passRate": 100,
            "prepared": 45
          },
          "date": "2026-02-27",
          "id": "pairwise70_cardio",
          "name": "Pairwise70 Cardio End-to-End",
          "sourcePath": "validation/reports/pairwise70_cardio_benchmark/pairwise70_cardio_end_to_end_report.json",
          "summary": "45/45 prepared cardiovascular datasets passed using ClinicalTrials.gov, PubMed, and OpenAlex only, with no PDF extraction pipeline.",
          "tier": "domain",
          "verdict": "PASS"
        },
        "report_summary": {
          "scope": {
            "domain": "cardiovascular",
            "design": "RCT-focused Pairwise70 Cochrane study-level",
            "sources": [
              "ClinicalTrials.gov",
              "AACT",
              "PubMed",
              "OpenAlex"
            ],
            "pdf_pipeline_used": false
          },
          "counts": {
            "cardio_review_ids": 52,
            "cardio_dataset_files": 47,
            "prepared_datasets": 45,
            "skipped_datasets": 2,
            "pass": 45,
            "fail": 0,
            "error": 0,
            "pass_rate": 100.0
          },
          "elapsed_seconds": 9.37
        }
      }
    },
    {
      "category": "Hypertension",
      "extraction": {
        "ctgov": {
          "has2x2": false,
          "hasReportedEffect": false,
          "hasResults": false,
          "matchScore": 45,
          "matchedOutcome": "Number of Participants With First Occurrence of a Myocardial Infarction (MI), Acute Coronary Syndrome (ACS), Stroke, Heart Failure (HF), or CVD Death",
          "recordExtract": "Number of Participants With First Occurrence of a Myocardial Infarction (MI), Acute Coronary Syndrome (ACS), Stroke, Heart Failure (HF), or CVD Death | Tx --/-- vs Ctrl --/--",
          "sampleNctId": "NCT04993924",
          "success": false
        },
        "pubmed": {
          "effectCount": 1,
          "firstExtract": "rate ratio 0.93 (95% CI 0.81 to 1.05",
          "pmid": "41365607",
          "success": true,
          "title": "Association of blood pressure control with atrial and ventricular ectopy in SPRINT."
        }
      },
      "failReasons": [
        "ctgov_anchor_recall",
        "ctgov_extract"
      ],
      "name": "Intensive blood pressure targets - Stroke",
      "policy": {
        "allowedSources": [
          "ctgov",
          "pubmed",
          "openalex"
        ],
        "extractionMode": "pubmed-abstract-and-ctgov-records-only",
        "pass": true,
        "pdfUploadHidden": true,
        "pdfViewerHidden": true,
        "yearFloor": 2015
      },
      "screening": {
        "humanCheckable": true,
        "recordsWithAnchors": 0
      },
      "search": {
        "ctgov": {
          "anchorRecall": 0,
          "count": 14,
          "eligible": 3,
          "firstResult": {
            "nctId": "NCT06431178",
            "title": "A Comparative Study Between General Anesthesia Versus Sedation By Dexmedetomidine and Ketamine With Local Infiltration for Percutaneous Transcatheter Closure of Atrial Septal Defect in Pediatric Patients",
            "year": "2024"
          },
          "matched": [],
          "statusText": "CT.gov: kept 14 trials after applying the 2015+ floor"
        },
        "openalex": {
          "anchorRecall": 0.6666666666666666,
          "count": 20,
          "eligible": 3,
          "firstResult": {
            "doi": "10.1159/000455130",
            "pmid": "28161697",
            "title": "In the Wake of Systolic Blood Pressure Intervention Trial: New Targets for Improving Hypertension Management in Chronic Kidney Disease?",
            "year": "2017"
          },
          "matched": [
            "NCT01206062",
            "NCT03015311"
          ],
          "statusText": "OpenAlex: kept 20 records after applying the 2015+ floor"
        },
        "pubmed": {
          "anchorRecall": 1,
          "count": 20,
          "eligible": 3,
          "firstResult": {
            "doi": "10.1186/s12916-026-04678-2",
            "nctId": "NCT03527719",
            "pmid": "41776553",
            "title": "Cardiovascular outcomes of intensive blood pressure control in patients with and without metabolic dysfunction-associated fatty liver disease: post hoc analysis of the CRHCP trial.",
            "year": "2026"
          },
          "matched": [
            "NCT01206062",
            "NCT03015311",
            "NCT04993924"
          ],
          "statusText": "2165 total results (PubMed: 20)"
        }
      },
      "status": "warn",
      "topicId": "intensive_bp_stroke",
      "validationPackId": "pairwise70_cardio",
      "id": "intensive_bp_stroke",
      "pack": {
        "id": "pairwise70_cardio",
        "meta": {
          "counts": {
            "error": 0,
            "fail": 0,
            "pass": 45,
            "passRate": 100,
            "prepared": 45
          },
          "date": "2026-02-27",
          "id": "pairwise70_cardio",
          "name": "Pairwise70 Cardio End-to-End",
          "sourcePath": "validation/reports/pairwise70_cardio_benchmark/pairwise70_cardio_end_to_end_report.json",
          "summary": "45/45 prepared cardiovascular datasets passed using ClinicalTrials.gov, PubMed, and OpenAlex only, with no PDF extraction pipeline.",
          "tier": "domain",
          "verdict": "PASS"
        },
        "report_summary": {
          "scope": {
            "domain": "cardiovascular",
            "design": "RCT-focused Pairwise70 Cochrane study-level",
            "sources": [
              "ClinicalTrials.gov",
              "AACT",
              "PubMed",
              "OpenAlex"
            ],
            "pdf_pipeline_used": false
          },
          "counts": {
            "cardio_review_ids": 52,
            "cardio_dataset_files": 47,
            "prepared_datasets": 45,
            "skipped_datasets": 2,
            "pass": 45,
            "fail": 0,
            "error": 0,
            "pass_rate": 100.0
          },
          "elapsed_seconds": 9.37
        }
      }
    },
    {
      "category": "Hypertension",
      "extraction": {
        "ctgov": {
          "has2x2": false,
          "hasReportedEffect": false,
          "hasResults": false,
          "matchScore": 45,
          "matchedOutcome": "Number of CKD Participants Who Experienced a 50% Decline From Baseline eGFR",
          "recordExtract": "Number of CKD Participants Who Experienced a 50% Decline From Baseline eGFR | Tx --/-- vs Ctrl --/--",
          "sampleNctId": "NCT04993924",
          "success": false
        },
        "pubmed": {
          "effectCount": 1,
          "firstExtract": "rate ratio 0.93 (95% CI 0.81 to 1.05",
          "pmid": "41365607",
          "success": true,
          "title": "Association of blood pressure control with atrial and ventricular ectopy in SPRINT."
        }
      },
      "failReasons": [
        "ctgov_anchor_recall",
        "ctgov_extract"
      ],
      "name": "Intensive blood pressure targets - Kidney outcomes",
      "policy": {
        "allowedSources": [
          "ctgov",
          "pubmed",
          "openalex"
        ],
        "extractionMode": "pubmed-abstract-and-ctgov-records-only",
        "pass": true,
        "pdfUploadHidden": true,
        "pdfViewerHidden": true,
        "yearFloor": 2015
      },
      "screening": {
        "humanCheckable": true,
        "recordsWithAnchors": 0
      },
      "search": {
        "ctgov": {
          "anchorRecall": 0,
          "count": 14,
          "eligible": 3,
          "firstResult": {
            "nctId": "NCT06431178",
            "title": "A Comparative Study Between General Anesthesia Versus Sedation By Dexmedetomidine and Ketamine With Local Infiltration for Percutaneous Transcatheter Closure of Atrial Septal Defect in Pediatric Patients",
            "year": "2024"
          },
          "matched": [],
          "statusText": "CT.gov: kept 14 trials after applying the 2015+ floor"
        },
        "openalex": {
          "anchorRecall": 0.6666666666666666,
          "count": 20,
          "eligible": 3,
          "firstResult": {
            "doi": "10.1159/000455130",
            "pmid": "28161697",
            "title": "In the Wake of Systolic Blood Pressure Intervention Trial: New Targets for Improving Hypertension Management in Chronic Kidney Disease?",
            "year": "2017"
          },
          "matched": [
            "NCT01206062",
            "NCT03015311"
          ],
          "statusText": "OpenAlex: kept 20 records after applying the 2015+ floor"
        },
        "pubmed": {
          "anchorRecall": 1,
          "count": 20,
          "eligible": 3,
          "firstResult": {
            "doi": "10.1186/s12916-026-04678-2",
            "nctId": "NCT03527719",
            "pmid": "41776553",
            "title": "Cardiovascular outcomes of intensive blood pressure control in patients with and without metabolic dysfunction-associated fatty liver disease: post hoc analysis of the CRHCP trial.",
            "year": "2026"
          },
          "matched": [
            "NCT01206062",
            "NCT03015311",
            "NCT04993924"
          ],
          "statusText": "2219 total results (PubMed: 20)"
        }
      },
      "status": "warn",
      "topicId": "intensive_bp_ckd",
      "validationPackId": "pairwise70_cardio",
      "id": "intensive_bp_ckd",
      "pack": {
        "id": "pairwise70_cardio",
        "meta": {
          "counts": {
            "error": 0,
            "fail": 0,
            "pass": 45,
            "passRate": 100,
            "prepared": 45
          },
          "date": "2026-02-27",
          "id": "pairwise70_cardio",
          "name": "Pairwise70 Cardio End-to-End",
          "sourcePath": "validation/reports/pairwise70_cardio_benchmark/pairwise70_cardio_end_to_end_report.json",
          "summary": "45/45 prepared cardiovascular datasets passed using ClinicalTrials.gov, PubMed, and OpenAlex only, with no PDF extraction pipeline.",
          "tier": "domain",
          "verdict": "PASS"
        },
        "report_summary": {
          "scope": {
            "domain": "cardiovascular",
            "design": "RCT-focused Pairwise70 Cochrane study-level",
            "sources": [
              "ClinicalTrials.gov",
              "AACT",
              "PubMed",
              "OpenAlex"
            ],
            "pdf_pipeline_used": false
          },
          "counts": {
            "cardio_review_ids": 52,
            "cardio_dataset_files": 47,
            "prepared_datasets": 45,
            "skipped_datasets": 2,
            "pass": 45,
            "fail": 0,
            "error": 0,
            "pass_rate": 100.0
          },
          "elapsed_seconds": 9.37
        }
      }
    },
    {
      "category": "Hypertension",
      "extraction": {
        "ctgov": {
          "has2x2": false,
          "hasReportedEffect": false,
          "hasResults": false,
          "matchScore": 27,
          "matchedOutcome": "Number of Participants With First Occurrence of a Myocardial Infarction (MI), Acute Coronary Syndrome (ACS), Stroke, Heart Failure (HF), or CVD Death",
          "recordExtract": "Number of Participants With First Occurrence of a Myocardial Infarction (MI), Acute Coronary Syndrome (ACS), Stroke, Heart Failure (HF), or CVD Death | Tx --/-- vs Ctrl --/--",
          "sampleNctId": "NCT04993924",
          "success": false
        },
        "pubmed": {
          "effectCount": 1,
          "firstExtract": "rate ratio 0.93 (95% CI 0.81 to 1.05",
          "pmid": "41365607",
          "success": true,
          "title": "Association of blood pressure control with atrial and ventricular ectopy in SPRINT."
        }
      },
      "failReasons": [
        "ctgov_anchor_recall",
        "ctgov_extract"
      ],
      "name": "Intensive blood pressure targets - Older adults",
      "policy": {
        "allowedSources": [
          "ctgov",
          "pubmed",
          "openalex"
        ],
        "extractionMode": "pubmed-abstract-and-ctgov-records-only",
        "pass": true,
        "pdfUploadHidden": true,
        "pdfViewerHidden": true,
        "yearFloor": 2015
      },
      "screening": {
        "humanCheckable": true,
        "recordsWithAnchors": 0
      },
      "search": {
        "ctgov": {
          "anchorRecall": 0,
          "count": 14,
          "eligible": 3,
          "firstResult": {
            "nctId": "NCT06431178",
            "title": "A Comparative Study Between General Anesthesia Versus Sedation By Dexmedetomidine and Ketamine With Local Infiltration for Percutaneous Transcatheter Closure of Atrial Septal Defect in Pediatric Patients",
            "year": "2024"
          },
          "matched": [],
          "statusText": "CT.gov: kept 14 trials after applying the 2015+ floor"
        },
        "openalex": {
          "anchorRecall": 0.6666666666666666,
          "count": 20,
          "eligible": 3,
          "firstResult": {
            "doi": "10.1159/000455130",
            "pmid": "28161697",
            "title": "In the Wake of Systolic Blood Pressure Intervention Trial: New Targets for Improving Hypertension Management in Chronic Kidney Disease?",
            "year": "2017"
          },
          "matched": [
            "NCT01206062",
            "NCT03015311"
          ],
          "statusText": "OpenAlex: kept 20 records after applying the 2015+ floor"
        },
        "pubmed": {
          "anchorRecall": 1,
          "count": 20,
          "eligible": 3,
          "firstResult": {
            "doi": "10.1186/s12916-026-04678-2",
            "nctId": "NCT03527719",
            "pmid": "41776553",
            "title": "Cardiovascular outcomes of intensive blood pressure control in patients with and without metabolic dysfunction-associated fatty liver disease: post hoc analysis of the CRHCP trial.",
            "year": "2026"
          },
          "matched": [
            "NCT01206062",
            "NCT03015311",
            "NCT04993924"
          ],
          "statusText": "2273 total results (PubMed: 20)"
        }
      },
      "status": "warn",
      "topicId": "intensive_bp_elderly",
      "validationPackId": "pairwise70_cardio",
      "id": "intensive_bp_elderly",
      "pack": {
        "id": "pairwise70_cardio",
        "meta": {
          "counts": {
            "error": 0,
            "fail": 0,
            "pass": 45,
            "passRate": 100,
            "prepared": 45
          },
          "date": "2026-02-27",
          "id": "pairwise70_cardio",
          "name": "Pairwise70 Cardio End-to-End",
          "sourcePath": "validation/reports/pairwise70_cardio_benchmark/pairwise70_cardio_end_to_end_report.json",
          "summary": "45/45 prepared cardiovascular datasets passed using ClinicalTrials.gov, PubMed, and OpenAlex only, with no PDF extraction pipeline.",
          "tier": "domain",
          "verdict": "PASS"
        },
        "report_summary": {
          "scope": {
            "domain": "cardiovascular",
            "design": "RCT-focused Pairwise70 Cochrane study-level",
            "sources": [
              "ClinicalTrials.gov",
              "AACT",
              "PubMed",
              "OpenAlex"
            ],
            "pdf_pipeline_used": false
          },
          "counts": {
            "cardio_review_ids": 52,
            "cardio_dataset_files": 47,
            "prepared_datasets": 45,
            "skipped_datasets": 2,
            "pass": 45,
            "fail": 0,
            "error": 0,
            "pass_rate": 100.0
          },
          "elapsed_seconds": 9.37
        }
      }
    },
    {
      "category": "Hypertension",
      "extraction": {
        "ctgov": {
          "has2x2": false,
          "hasReportedEffect": false,
          "hasResults": false,
          "matchScore": 39,
          "matchedOutcome": "Trio Cohort - Median Change in Daytime Ambulatory Systolic BP",
          "recordExtract": "Trio Cohort - Median Change in Daytime Ambulatory Systolic BP | Tx --/-- vs Ctrl --/--",
          "sampleNctId": "NCT03614260",
          "success": false
        },
        "pubmed": {
          "effectCount": 0,
          "firstExtract": "",
          "pmid": "40803758",
          "success": false,
          "title": "Renal Denervation in Hypertension and Chronic Heart Failure."
        }
      },
      "failReasons": [
        "ctgov_anchor_recall",
        "ctgov_extract",
        "pubmed_extract"
      ],
      "name": "Renal denervation - Office SBP",
      "policy": {
        "allowedSources": [
          "ctgov",
          "pubmed",
          "openalex"
        ],
        "extractionMode": "pubmed-abstract-and-ctgov-records-only",
        "pass": true,
        "pdfUploadHidden": true,
        "pdfViewerHidden": true,
        "yearFloor": 2015
      },
      "screening": {
        "humanCheckable": true,
        "recordsWithAnchors": 0
      },
      "search": {
        "ctgov": {
          "anchorRecall": 0,
          "count": 6,
          "eligible": 4,
          "firstResult": {
            "nctId": "NCT02901704",
            "title": "A Prospective, Multi-centers, Randomized,Controlled, Blinded,Superiority Trial of Renal Denervation Using Iberis MultiElectrode Renal Denervation System for the Treatment of Primary Hypertension.",
            "year": "2016"
          },
          "matched": [],
          "statusText": "CT.gov: kept 6 trials after applying the 2015+ floor"
        },
        "openalex": {
          "anchorRecall": 1,
          "count": 20,
          "eligible": 4,
          "firstResult": {
            "doi": "10.1161/hypertensionaha.115.05283",
            "nctId": "NCT01656096",
            "pmid": "25824248",
            "title": "Randomized Sham-Controlled Trial of Renal Sympathetic Denervation in Mild Resistant Hypertension",
            "year": "2015"
          },
          "matched": [
            "NCT02439775",
            "NCT02439749",
            "NCT02649426",
            "NCT03614260"
          ],
          "statusText": "OpenAlex: kept 20 records after applying the 2015+ floor"
        },
        "pubmed": {
          "anchorRecall": 0.25,
          "count": 20,
          "eligible": 4,
          "firstResult": {
            "doi": "10.1136/heartjnl-2025-326186",
            "pmid": "41819559",
            "title": "Renal denervation in 2026: trial evidence, guideline recommendations and implementation strategies for clinical practice.",
            "year": "2026"
          },
          "matched": [
            "NCT02439749"
          ],
          "statusText": "2319 total results (PubMed: 20)"
        }
      },
      "status": "fail",
      "topicId": "renal_denervation_office",
      "validationPackId": "pairwise70_cardio",
      "id": "renal_denervation_office",
      "pack": {
        "id": "pairwise70_cardio",
        "meta": {
          "counts": {
            "error": 0,
            "fail": 0,
            "pass": 45,
            "passRate": 100,
            "prepared": 45
          },
          "date": "2026-02-27",
          "id": "pairwise70_cardio",
          "name": "Pairwise70 Cardio End-to-End",
          "sourcePath": "validation/reports/pairwise70_cardio_benchmark/pairwise70_cardio_end_to_end_report.json",
          "summary": "45/45 prepared cardiovascular datasets passed using ClinicalTrials.gov, PubMed, and OpenAlex only, with no PDF extraction pipeline.",
          "tier": "domain",
          "verdict": "PASS"
        },
        "report_summary": {
          "scope": {
            "domain": "cardiovascular",
            "design": "RCT-focused Pairwise70 Cochrane study-level",
            "sources": [
              "ClinicalTrials.gov",
              "AACT",
              "PubMed",
              "OpenAlex"
            ],
            "pdf_pipeline_used": false
          },
          "counts": {
            "cardio_review_ids": 52,
            "cardio_dataset_files": 47,
            "prepared_datasets": 45,
            "skipped_datasets": 2,
            "pass": 45,
            "fail": 0,
            "error": 0,
            "pass_rate": 100.0
          },
          "elapsed_seconds": 9.37
        }
      }
    },
    {
      "category": "Hypertension",
      "extraction": {
        "ctgov": {
          "has2x2": false,
          "hasReportedEffect": false,
          "hasResults": false,
          "matchScore": 51,
          "matchedOutcome": "Trio Cohort - Median Change in Daytime Ambulatory Systolic BP",
          "recordExtract": "Trio Cohort - Median Change in Daytime Ambulatory Systolic BP | Tx --/-- vs Ctrl --/--",
          "sampleNctId": "NCT03614260",
          "success": false
        },
        "pubmed": {
          "effectCount": 0,
          "firstExtract": "",
          "pmid": "40803758",
          "success": false,
          "title": "Renal Denervation in Hypertension and Chronic Heart Failure."
        }
      },
      "failReasons": [
        "ctgov_anchor_recall",
        "ctgov_extract",
        "pubmed_extract"
      ],
      "name": "Renal denervation - Ambulatory SBP",
      "policy": {
        "allowedSources": [
          "ctgov",
          "pubmed",
          "openalex"
        ],
        "extractionMode": "pubmed-abstract-and-ctgov-records-only",
        "pass": true,
        "pdfUploadHidden": true,
        "pdfViewerHidden": true,
        "yearFloor": 2015
      },
      "screening": {
        "humanCheckable": true,
        "recordsWithAnchors": 0
      },
      "search": {
        "ctgov": {
          "anchorRecall": 0,
          "count": 6,
          "eligible": 4,
          "firstResult": {
            "nctId": "NCT02901704",
            "title": "A Prospective, Multi-centers, Randomized,Controlled, Blinded,Superiority Trial of Renal Denervation Using Iberis MultiElectrode Renal Denervation System for the Treatment of Primary Hypertension.",
            "year": "2016"
          },
          "matched": [],
          "statusText": "CT.gov: kept 6 trials after applying the 2015+ floor"
        },
        "openalex": {
          "anchorRecall": 1,
          "count": 20,
          "eligible": 4,
          "firstResult": {
            "doi": "10.1161/hypertensionaha.115.05283",
            "nctId": "NCT01656096",
            "pmid": "25824248",
            "title": "Randomized Sham-Controlled Trial of Renal Sympathetic Denervation in Mild Resistant Hypertension",
            "year": "2015"
          },
          "matched": [
            "NCT02439775",
            "NCT02439749",
            "NCT02649426",
            "NCT03614260"
          ],
          "statusText": "OpenAlex: kept 20 records after applying the 2015+ floor"
        },
        "pubmed": {
          "anchorRecall": 0.25,
          "count": 20,
          "eligible": 4,
          "firstResult": {
            "doi": "10.1136/heartjnl-2025-326186",
            "pmid": "41819559",
            "title": "Renal denervation in 2026: trial evidence, guideline recommendations and implementation strategies for clinical practice.",
            "year": "2026"
          },
          "matched": [
            "NCT02439749"
          ],
          "statusText": "2365 total results (PubMed: 20)"
        }
      },
      "status": "fail",
      "topicId": "renal_denervation_ambulatory",
      "validationPackId": "pairwise70_cardio",
      "id": "renal_denervation_ambulatory",
      "pack": {
        "id": "pairwise70_cardio",
        "meta": {
          "counts": {
            "error": 0,
            "fail": 0,
            "pass": 45,
            "passRate": 100,
            "prepared": 45
          },
          "date": "2026-02-27",
          "id": "pairwise70_cardio",
          "name": "Pairwise70 Cardio End-to-End",
          "sourcePath": "validation/reports/pairwise70_cardio_benchmark/pairwise70_cardio_end_to_end_report.json",
          "summary": "45/45 prepared cardiovascular datasets passed using ClinicalTrials.gov, PubMed, and OpenAlex only, with no PDF extraction pipeline.",
          "tier": "domain",
          "verdict": "PASS"
        },
        "report_summary": {
          "scope": {
            "domain": "cardiovascular",
            "design": "RCT-focused Pairwise70 Cochrane study-level",
            "sources": [
              "ClinicalTrials.gov",
              "AACT",
              "PubMed",
              "OpenAlex"
            ],
            "pdf_pipeline_used": false
          },
          "counts": {
            "cardio_review_ids": 52,
            "cardio_dataset_files": 47,
            "prepared_datasets": 45,
            "skipped_datasets": 2,
            "pass": 45,
            "fail": 0,
            "error": 0,
            "pass_rate": 100.0
          },
          "elapsed_seconds": 9.37
        }
      }
    },
    {
      "category": "Hypertension",
      "extraction": {
        "ctgov": {
          "has2x2": false,
          "hasReportedEffect": false,
          "hasResults": false,
          "matchScore": 27,
          "matchedOutcome": "Reduction in Average 24-hr/Night-time Ambulatory Systolic BP",
          "recordExtract": "Reduction in Average 24-hr/Night-time Ambulatory Systolic BP | Tx --/-- vs Ctrl --/--",
          "sampleNctId": "NCT03614260",
          "success": false
        },
        "pubmed": {
          "effectCount": 0,
          "firstExtract": "",
          "pmid": "40803758",
          "success": false,
          "title": "Renal Denervation in Hypertension and Chronic Heart Failure."
        }
      },
      "failReasons": [
        "ctgov_anchor_recall",
        "ctgov_extract",
        "pubmed_extract"
      ],
      "name": "Renal denervation - Medication-on background",
      "policy": {
        "allowedSources": [
          "ctgov",
          "pubmed",
          "openalex"
        ],
        "extractionMode": "pubmed-abstract-and-ctgov-records-only",
        "pass": true,
        "pdfUploadHidden": true,
        "pdfViewerHidden": true,
        "yearFloor": 2015
      },
      "screening": {
        "humanCheckable": true,
        "recordsWithAnchors": 0
      },
      "search": {
        "ctgov": {
          "anchorRecall": 0,
          "count": 6,
          "eligible": 4,
          "firstResult": {
            "nctId": "NCT02901704",
            "title": "A Prospective, Multi-centers, Randomized,Controlled, Blinded,Superiority Trial of Renal Denervation Using Iberis MultiElectrode Renal Denervation System for the Treatment of Primary Hypertension.",
            "year": "2016"
          },
          "matched": [],
          "statusText": "CT.gov: kept 6 trials after applying the 2015+ floor"
        },
        "openalex": {
          "anchorRecall": 1,
          "count": 20,
          "eligible": 4,
          "firstResult": {
            "doi": "10.1161/hypertensionaha.115.05283",
            "nctId": "NCT01656096",
            "pmid": "25824248",
            "title": "Randomized Sham-Controlled Trial of Renal Sympathetic Denervation in Mild Resistant Hypertension",
            "year": "2015"
          },
          "matched": [
            "NCT02439775",
            "NCT02439749",
            "NCT02649426",
            "NCT03614260"
          ],
          "statusText": "OpenAlex: kept 20 records after applying the 2015+ floor"
        },
        "pubmed": {
          "anchorRecall": 0.25,
          "count": 20,
          "eligible": 4,
          "firstResult": {
            "doi": "10.1136/heartjnl-2025-326186",
            "pmid": "41819559",
            "title": "Renal denervation in 2026: trial evidence, guideline recommendations and implementation strategies for clinical practice.",
            "year": "2026"
          },
          "matched": [
            "NCT02439749"
          ],
          "statusText": "2411 total results (PubMed: 20)"
        }
      },
      "status": "fail",
      "topicId": "renal_denervation_medication",
      "validationPackId": "pairwise70_cardio",
      "id": "renal_denervation_medication",
      "pack": {
        "id": "pairwise70_cardio",
        "meta": {
          "counts": {
            "error": 0,
            "fail": 0,
            "pass": 45,
            "passRate": 100,
            "prepared": 45
          },
          "date": "2026-02-27",
          "id": "pairwise70_cardio",
          "name": "Pairwise70 Cardio End-to-End",
          "sourcePath": "validation/reports/pairwise70_cardio_benchmark/pairwise70_cardio_end_to_end_report.json",
          "summary": "45/45 prepared cardiovascular datasets passed using ClinicalTrials.gov, PubMed, and OpenAlex only, with no PDF extraction pipeline.",
          "tier": "domain",
          "verdict": "PASS"
        },
        "report_summary": {
          "scope": {
            "domain": "cardiovascular",
            "design": "RCT-focused Pairwise70 Cochrane study-level",
            "sources": [
              "ClinicalTrials.gov",
              "AACT",
              "PubMed",
              "OpenAlex"
            ],
            "pdf_pipeline_used": false
          },
          "counts": {
            "cardio_review_ids": 52,
            "cardio_dataset_files": 47,
            "prepared_datasets": 45,
            "skipped_datasets": 2,
            "pass": 45,
            "fail": 0,
            "error": 0,
            "pass_rate": 100.0
          },
          "elapsed_seconds": 9.37
        }
      }
    },
    {
      "category": "Coronary Disease",
      "extraction": {
        "ctgov": {
          "has2x2": false,
          "hasReportedEffect": false,
          "hasResults": false,
          "matchScore": 15,
          "matchedOutcome": "Number of Participants With BARC Type 2, 3, or 5",
          "recordExtract": "Number of Participants With BARC Type 2, 3, or 5 | Tx --/-- vs Ctrl --/--",
          "sampleNctId": "NCT02494895",
          "success": false
        },
        "pubmed": {
          "effectCount": 1,
          "firstExtract": "OR 1.00, 95% CI 0.54 to 1.86",
          "pmid": "41497404",
          "success": true,
          "title": "Safety and Efficacy Comparison of Ticagrelor versus Other P2Y12 Inhibitors in Combination with Oral Anticoagulants as a Part of DAPT/SAPT in Patients with Concomitant Atrial Fibrillation and Coronary Artery Disease: A Meta-Analysis."
        }
      },
      "failReasons": [
        "ctgov_extract"
      ],
      "name": "P2Y12 monotherapy after PCI - MACE",
      "policy": {
        "allowedSources": [
          "ctgov",
          "pubmed",
          "openalex"
        ],
        "extractionMode": "pubmed-abstract-and-ctgov-records-only",
        "pass": true,
        "pdfUploadHidden": true,
        "pdfViewerHidden": true,
        "yearFloor": 2015
      },
      "screening": {
        "humanCheckable": true,
        "recordsWithAnchors": 1
      },
      "search": {
        "ctgov": {
          "anchorRecall": 0.2,
          "count": 19,
          "eligible": 5,
          "firstResult": {
            "nctId": "NCT02642419",
            "title": "Atrial Fibrillation and Ischemic Events With Rivaroxaban in Patients With Stable Coronary Artery Disease Study (AFIRE Study)",
            "year": "2015"
          },
          "matched": [
            "NCT02494895"
          ],
          "statusText": "CT.gov: kept 19 trials after applying the 2015+ floor"
        },
        "openalex": {
          "anchorRecall": 0.8,
          "count": 20,
          "eligible": 5,
          "firstResult": {
            "doi": "10.1016/j.ahj.2016.09.006",
            "title": "Ticagrelor with aspirin or alone in high-risk patients after coronary intervention: Rationale and design of the TWILIGHT study",
            "year": "2016"
          },
          "matched": [
            "NCT02079194",
            "NCT02619760",
            "NCT02270242",
            "NCT02494895"
          ],
          "statusText": "OpenAlex: kept 20 records after applying the 2015+ floor"
        },
        "pubmed": {
          "anchorRecall": 0.2,
          "count": 20,
          "eligible": 5,
          "firstResult": {
            "doi": "10.14740/cr2180",
            "pmid": "41822823",
            "title": "Assessment of No-Reflow in Patients With STEMI After Intracoronary Tirofiban After Opening of the Vessel.",
            "year": "2026"
          },
          "matched": [
            "NCT02494895"
          ],
          "statusText": "2470 total results (PubMed: 20)"
        }
      },
      "status": "warn",
      "topicId": "p2y12_monotherapy_pci_mace",
      "validationPackId": "pairwise70_cardio",
      "id": "p2y12_monotherapy_pci_mace",
      "pack": {
        "id": "pairwise70_cardio",
        "meta": {
          "counts": {
            "error": 0,
            "fail": 0,
            "pass": 45,
            "passRate": 100,
            "prepared": 45
          },
          "date": "2026-02-27",
          "id": "pairwise70_cardio",
          "name": "Pairwise70 Cardio End-to-End",
          "sourcePath": "validation/reports/pairwise70_cardio_benchmark/pairwise70_cardio_end_to_end_report.json",
          "summary": "45/45 prepared cardiovascular datasets passed using ClinicalTrials.gov, PubMed, and OpenAlex only, with no PDF extraction pipeline.",
          "tier": "domain",
          "verdict": "PASS"
        },
        "report_summary": {
          "scope": {
            "domain": "cardiovascular",
            "design": "RCT-focused Pairwise70 Cochrane study-level",
            "sources": [
              "ClinicalTrials.gov",
              "AACT",
              "PubMed",
              "OpenAlex"
            ],
            "pdf_pipeline_used": false
          },
          "counts": {
            "cardio_review_ids": 52,
            "cardio_dataset_files": 47,
            "prepared_datasets": 45,
            "skipped_datasets": 2,
            "pass": 45,
            "fail": 0,
            "error": 0,
            "pass_rate": 100.0
          },
          "elapsed_seconds": 9.37
        }
      }
    },
    {
      "category": "Coronary Disease",
      "extraction": {
        "ctgov": {
          "has2x2": false,
          "hasReportedEffect": false,
          "hasResults": false,
          "matchScore": 15,
          "matchedOutcome": "Number of Participants With BARC Type 2, 3, or 5",
          "recordExtract": "Number of Participants With BARC Type 2, 3, or 5 | Tx --/-- vs Ctrl --/--",
          "sampleNctId": "NCT02494895",
          "success": false
        },
        "pubmed": {
          "effectCount": 1,
          "firstExtract": "OR 1.00, 95% CI 0.54 to 1.86",
          "pmid": "41497404",
          "success": true,
          "title": "Safety and Efficacy Comparison of Ticagrelor versus Other P2Y12 Inhibitors in Combination with Oral Anticoagulants as a Part of DAPT/SAPT in Patients with Concomitant Atrial Fibrillation and Coronary Artery Disease: A Meta-Analysis."
        }
      },
      "failReasons": [
        "ctgov_extract"
      ],
      "name": "P2Y12 monotherapy after PCI - Bleeding",
      "policy": {
        "allowedSources": [
          "ctgov",
          "pubmed",
          "openalex"
        ],
        "extractionMode": "pubmed-abstract-and-ctgov-records-only",
        "pass": true,
        "pdfUploadHidden": true,
        "pdfViewerHidden": true,
        "yearFloor": 2015
      },
      "screening": {
        "humanCheckable": true,
        "recordsWithAnchors": 1
      },
      "search": {
        "ctgov": {
          "anchorRecall": 0.2,
          "count": 19,
          "eligible": 5,
          "firstResult": {
            "nctId": "NCT02642419",
            "title": "Atrial Fibrillation and Ischemic Events With Rivaroxaban in Patients With Stable Coronary Artery Disease Study (AFIRE Study)",
            "year": "2015"
          },
          "matched": [
            "NCT02494895"
          ],
          "statusText": "CT.gov: kept 19 trials after applying the 2015+ floor"
        },
        "openalex": {
          "anchorRecall": 0.8,
          "count": 20,
          "eligible": 5,
          "firstResult": {
            "doi": "10.1016/j.ahj.2016.09.006",
            "title": "Ticagrelor with aspirin or alone in high-risk patients after coronary intervention: Rationale and design of the TWILIGHT study",
            "year": "2016"
          },
          "matched": [
            "NCT02079194",
            "NCT02619760",
            "NCT02270242",
            "NCT02494895"
          ],
          "statusText": "OpenAlex: kept 20 records after applying the 2015+ floor"
        },
        "pubmed": {
          "anchorRecall": 0.2,
          "count": 20,
          "eligible": 5,
          "firstResult": {
            "doi": "10.14740/cr2180",
            "pmid": "41822823",
            "title": "Assessment of No-Reflow in Patients With STEMI After Intracoronary Tirofiban After Opening of the Vessel.",
            "year": "2026"
          },
          "matched": [
            "NCT02494895"
          ],
          "statusText": "2529 total results (PubMed: 20)"
        }
      },
      "status": "warn",
      "topicId": "p2y12_monotherapy_pci_bleeding",
      "validationPackId": "pairwise70_cardio",
      "id": "p2y12_monotherapy_pci_bleeding",
      "pack": {
        "id": "pairwise70_cardio",
        "meta": {
          "counts": {
            "error": 0,
            "fail": 0,
            "pass": 45,
            "passRate": 100,
            "prepared": 45
          },
          "date": "2026-02-27",
          "id": "pairwise70_cardio",
          "name": "Pairwise70 Cardio End-to-End",
          "sourcePath": "validation/reports/pairwise70_cardio_benchmark/pairwise70_cardio_end_to_end_report.json",
          "summary": "45/45 prepared cardiovascular datasets passed using ClinicalTrials.gov, PubMed, and OpenAlex only, with no PDF extraction pipeline.",
          "tier": "domain",
          "verdict": "PASS"
        },
        "report_summary": {
          "scope": {
            "domain": "cardiovascular",
            "design": "RCT-focused Pairwise70 Cochrane study-level",
            "sources": [
              "ClinicalTrials.gov",
              "AACT",
              "PubMed",
              "OpenAlex"
            ],
            "pdf_pipeline_used": false
          },
          "counts": {
            "cardio_review_ids": 52,
            "cardio_dataset_files": 47,
            "prepared_datasets": 45,
            "skipped_datasets": 2,
            "pass": 45,
            "fail": 0,
            "error": 0,
            "pass_rate": 100.0
          },
          "elapsed_seconds": 9.37
        }
      }
    },
    {
      "category": "Coronary Disease",
      "extraction": {
        "ctgov": {
          "has2x2": false,
          "hasReportedEffect": false,
          "hasResults": false,
          "matchScore": 15,
          "matchedOutcome": "Number of Participants With BARC Type 2, 3, or 5",
          "recordExtract": "Number of Participants With BARC Type 2, 3, or 5 | Tx --/-- vs Ctrl --/--",
          "sampleNctId": "NCT02494895",
          "success": false
        },
        "pubmed": {
          "effectCount": 1,
          "firstExtract": "OR 1.00, 95% CI 0.54 to 1.86",
          "pmid": "41497404",
          "success": true,
          "title": "Safety and Efficacy Comparison of Ticagrelor versus Other P2Y12 Inhibitors in Combination with Oral Anticoagulants as a Part of DAPT/SAPT in Patients with Concomitant Atrial Fibrillation and Coronary Artery Disease: A Meta-Analysis."
        }
      },
      "failReasons": [
        "ctgov_extract"
      ],
      "name": "P2Y12 monotherapy after PCI - ACS subgroup",
      "policy": {
        "allowedSources": [
          "ctgov",
          "pubmed",
          "openalex"
        ],
        "extractionMode": "pubmed-abstract-and-ctgov-records-only",
        "pass": true,
        "pdfUploadHidden": true,
        "pdfViewerHidden": true,
        "yearFloor": 2015
      },
      "screening": {
        "humanCheckable": true,
        "recordsWithAnchors": 1
      },
      "search": {
        "ctgov": {
          "anchorRecall": 0.2,
          "count": 19,
          "eligible": 5,
          "firstResult": {
            "nctId": "NCT02642419",
            "title": "Atrial Fibrillation and Ischemic Events With Rivaroxaban in Patients With Stable Coronary Artery Disease Study (AFIRE Study)",
            "year": "2015"
          },
          "matched": [
            "NCT02494895"
          ],
          "statusText": "CT.gov: kept 19 trials after applying the 2015+ floor"
        },
        "openalex": {
          "anchorRecall": 0.8,
          "count": 20,
          "eligible": 5,
          "firstResult": {
            "doi": "10.1016/j.ahj.2016.09.006",
            "title": "Ticagrelor with aspirin or alone in high-risk patients after coronary intervention: Rationale and design of the TWILIGHT study",
            "year": "2016"
          },
          "matched": [
            "NCT02079194",
            "NCT02619760",
            "NCT02270242",
            "NCT02494895"
          ],
          "statusText": "OpenAlex: kept 20 records after applying the 2015+ floor"
        },
        "pubmed": {
          "anchorRecall": 0.2,
          "count": 20,
          "eligible": 5,
          "firstResult": {
            "doi": "10.14740/cr2180",
            "pmid": "41822823",
            "title": "Assessment of No-Reflow in Patients With STEMI After Intracoronary Tirofiban After Opening of the Vessel.",
            "year": "2026"
          },
          "matched": [
            "NCT02494895"
          ],
          "statusText": "2588 total results (PubMed: 20)"
        }
      },
      "status": "warn",
      "topicId": "p2y12_monotherapy_pci_acs",
      "validationPackId": "pairwise70_cardio",
      "id": "p2y12_monotherapy_pci_acs",
      "pack": {
        "id": "pairwise70_cardio",
        "meta": {
          "counts": {
            "error": 0,
            "fail": 0,
            "pass": 45,
            "passRate": 100,
            "prepared": 45
          },
          "date": "2026-02-27",
          "id": "pairwise70_cardio",
          "name": "Pairwise70 Cardio End-to-End",
          "sourcePath": "validation/reports/pairwise70_cardio_benchmark/pairwise70_cardio_end_to_end_report.json",
          "summary": "45/45 prepared cardiovascular datasets passed using ClinicalTrials.gov, PubMed, and OpenAlex only, with no PDF extraction pipeline.",
          "tier": "domain",
          "verdict": "PASS"
        },
        "report_summary": {
          "scope": {
            "domain": "cardiovascular",
            "design": "RCT-focused Pairwise70 Cochrane study-level",
            "sources": [
              "ClinicalTrials.gov",
              "AACT",
              "PubMed",
              "OpenAlex"
            ],
            "pdf_pipeline_used": false
          },
          "counts": {
            "cardio_review_ids": 52,
            "cardio_dataset_files": 47,
            "prepared_datasets": 45,
            "skipped_datasets": 2,
            "pass": 45,
            "fail": 0,
            "error": 0,
            "pass_rate": 100.0
          },
          "elapsed_seconds": 9.37
        }
      }
    },
    {
      "category": "Coronary Disease",
      "extraction": {
        "ctgov": {
          "has2x2": false,
          "hasReportedEffect": false,
          "hasResults": false,
          "matchScore": null,
          "matchedOutcome": "",
          "recordExtract": "",
          "sampleNctId": "NCT03462498",
          "success": false
        },
        "pubmed": {
          "effectCount": 2,
          "firstExtract": "RR: 1.57; 95% CI: 1.06-2.34",
          "pmid": "41760043",
          "success": true,
          "title": "Antiplatelet dilemma: Clopidogrel or aspirin for long-term cardiovascular protection after dual antiplatelet therapy following PCI."
        }
      },
      "failReasons": [
        "ctgov_extract"
      ],
      "name": "Short DAPT after PCI - MACE",
      "policy": {
        "allowedSources": [
          "ctgov",
          "pubmed",
          "openalex"
        ],
        "extractionMode": "pubmed-abstract-and-ctgov-records-only",
        "pass": true,
        "pdfUploadHidden": true,
        "pdfViewerHidden": true,
        "yearFloor": 2015
      },
      "screening": {
        "humanCheckable": true,
        "recordsWithAnchors": 1
      },
      "search": {
        "ctgov": {
          "anchorRecall": 0.3333333333333333,
          "count": 15,
          "eligible": 3,
          "firstResult": {
            "nctId": "NCT02642419",
            "title": "Atrial Fibrillation and Ischemic Events With Rivaroxaban in Patients With Stable Coronary Artery Disease Study (AFIRE Study)",
            "year": "2015"
          },
          "matched": [
            "NCT02658955"
          ],
          "statusText": "CT.gov: kept 15 trials after applying the 2015+ floor"
        },
        "openalex": {
          "anchorRecall": 0.3333333333333333,
          "count": 20,
          "eligible": 3,
          "firstResult": {
            "doi": "10.1093/eurheartj/ehv320",
            "pmid": "22395108",
            "title": "2015 ESC Guidelines for the management of acute coronary syndromes in patients presenting without persistent ST-segment elevation",
            "year": "2015"
          },
          "matched": [
            "NCT02658955"
          ],
          "statusText": "OpenAlex: kept 20 records after applying the 2015+ floor"
        },
        "pubmed": {
          "anchorRecall": 0,
          "count": 20,
          "eligible": 3,
          "firstResult": {
            "doi": "10.3389/fcvm.2026.1731952",
            "pmid": "41815903",
            "title": "Drug-coated balloons in complex large-vessel coronary artery disease: a comprehensive review of current evidence and future perspectives.",
            "year": "2026"
          },
          "matched": [],
          "statusText": "2643 total results (PubMed: 20)"
        }
      },
      "status": "warn",
      "topicId": "short_dapt_pci_mace",
      "validationPackId": "pairwise70_cardio",
      "id": "short_dapt_pci_mace",
      "pack": {
        "id": "pairwise70_cardio",
        "meta": {
          "counts": {
            "error": 0,
            "fail": 0,
            "pass": 45,
            "passRate": 100,
            "prepared": 45
          },
          "date": "2026-02-27",
          "id": "pairwise70_cardio",
          "name": "Pairwise70 Cardio End-to-End",
          "sourcePath": "validation/reports/pairwise70_cardio_benchmark/pairwise70_cardio_end_to_end_report.json",
          "summary": "45/45 prepared cardiovascular datasets passed using ClinicalTrials.gov, PubMed, and OpenAlex only, with no PDF extraction pipeline.",
          "tier": "domain",
          "verdict": "PASS"
        },
        "report_summary": {
          "scope": {
            "domain": "cardiovascular",
            "design": "RCT-focused Pairwise70 Cochrane study-level",
            "sources": [
              "ClinicalTrials.gov",
              "AACT",
              "PubMed",
              "OpenAlex"
            ],
            "pdf_pipeline_used": false
          },
          "counts": {
            "cardio_review_ids": 52,
            "cardio_dataset_files": 47,
            "prepared_datasets": 45,
            "skipped_datasets": 2,
            "pass": 45,
            "fail": 0,
            "error": 0,
            "pass_rate": 100.0
          },
          "elapsed_seconds": 9.37
        }
      }
    },
    {
      "category": "Coronary Disease",
      "extraction": {
        "ctgov": {
          "has2x2": false,
          "hasReportedEffect": false,
          "hasResults": false,
          "matchScore": null,
          "matchedOutcome": "",
          "recordExtract": "",
          "sampleNctId": "NCT03462498",
          "success": false
        },
        "pubmed": {
          "effectCount": 2,
          "firstExtract": "RR: 1.57; 95% CI: 1.06-2.34",
          "pmid": "41760043",
          "success": true,
          "title": "Antiplatelet dilemma: Clopidogrel or aspirin for long-term cardiovascular protection after dual antiplatelet therapy following PCI."
        }
      },
      "failReasons": [
        "ctgov_extract"
      ],
      "name": "Short DAPT after PCI - Bleeding",
      "policy": {
        "allowedSources": [
          "ctgov",
          "pubmed",
          "openalex"
        ],
        "extractionMode": "pubmed-abstract-and-ctgov-records-only",
        "pass": true,
        "pdfUploadHidden": true,
        "pdfViewerHidden": true,
        "yearFloor": 2015
      },
      "screening": {
        "humanCheckable": true,
        "recordsWithAnchors": 1
      },
      "search": {
        "ctgov": {
          "anchorRecall": 0.3333333333333333,
          "count": 15,
          "eligible": 3,
          "firstResult": {
            "nctId": "NCT02642419",
            "title": "Atrial Fibrillation and Ischemic Events With Rivaroxaban in Patients With Stable Coronary Artery Disease Study (AFIRE Study)",
            "year": "2015"
          },
          "matched": [
            "NCT02658955"
          ],
          "statusText": "CT.gov: kept 15 trials after applying the 2015+ floor"
        },
        "openalex": {
          "anchorRecall": 0.3333333333333333,
          "count": 20,
          "eligible": 3,
          "firstResult": {
            "doi": "10.1093/eurheartj/ehv320",
            "pmid": "22395108",
            "title": "2015 ESC Guidelines for the management of acute coronary syndromes in patients presenting without persistent ST-segment elevation",
            "year": "2015"
          },
          "matched": [
            "NCT02658955"
          ],
          "statusText": "OpenAlex: kept 20 records after applying the 2015+ floor"
        },
        "pubmed": {
          "anchorRecall": 0,
          "count": 20,
          "eligible": 3,
          "firstResult": {
            "doi": "10.3389/fcvm.2026.1731952",
            "pmid": "41815903",
            "title": "Drug-coated balloons in complex large-vessel coronary artery disease: a comprehensive review of current evidence and future perspectives.",
            "year": "2026"
          },
          "matched": [],
          "statusText": "2698 total results (PubMed: 20)"
        }
      },
      "status": "warn",
      "topicId": "short_dapt_pci_bleeding",
      "validationPackId": "pairwise70_cardio",
      "id": "short_dapt_pci_bleeding",
      "pack": {
        "id": "pairwise70_cardio",
        "meta": {
          "counts": {
            "error": 0,
            "fail": 0,
            "pass": 45,
            "passRate": 100,
            "prepared": 45
          },
          "date": "2026-02-27",
          "id": "pairwise70_cardio",
          "name": "Pairwise70 Cardio End-to-End",
          "sourcePath": "validation/reports/pairwise70_cardio_benchmark/pairwise70_cardio_end_to_end_report.json",
          "summary": "45/45 prepared cardiovascular datasets passed using ClinicalTrials.gov, PubMed, and OpenAlex only, with no PDF extraction pipeline.",
          "tier": "domain",
          "verdict": "PASS"
        },
        "report_summary": {
          "scope": {
            "domain": "cardiovascular",
            "design": "RCT-focused Pairwise70 Cochrane study-level",
            "sources": [
              "ClinicalTrials.gov",
              "AACT",
              "PubMed",
              "OpenAlex"
            ],
            "pdf_pipeline_used": false
          },
          "counts": {
            "cardio_review_ids": 52,
            "cardio_dataset_files": 47,
            "prepared_datasets": 45,
            "skipped_datasets": 2,
            "pass": 45,
            "fail": 0,
            "error": 0,
            "pass_rate": 100.0
          },
          "elapsed_seconds": 9.37
        }
      }
    },
    {
      "category": "Coronary Disease",
      "extraction": {
        "ctgov": {
          "has2x2": false,
          "hasReportedEffect": false,
          "hasResults": false,
          "matchScore": null,
          "matchedOutcome": "",
          "recordExtract": "",
          "sampleNctId": "NCT03462498",
          "success": false
        },
        "pubmed": {
          "effectCount": 2,
          "firstExtract": "RR: 1.57; 95% CI: 1.06-2.34",
          "pmid": "41760043",
          "success": true,
          "title": "Antiplatelet dilemma: Clopidogrel or aspirin for long-term cardiovascular protection after dual antiplatelet therapy following PCI."
        }
      },
      "failReasons": [
        "ctgov_extract"
      ],
      "name": "Short DAPT after PCI - High bleeding risk",
      "policy": {
        "allowedSources": [
          "ctgov",
          "pubmed",
          "openalex"
        ],
        "extractionMode": "pubmed-abstract-and-ctgov-records-only",
        "pass": true,
        "pdfUploadHidden": true,
        "pdfViewerHidden": true,
        "yearFloor": 2015
      },
      "screening": {
        "humanCheckable": true,
        "recordsWithAnchors": 1
      },
      "search": {
        "ctgov": {
          "anchorRecall": 0.3333333333333333,
          "count": 15,
          "eligible": 3,
          "firstResult": {
            "nctId": "NCT02642419",
            "title": "Atrial Fibrillation and Ischemic Events With Rivaroxaban in Patients With Stable Coronary Artery Disease Study (AFIRE Study)",
            "year": "2015"
          },
          "matched": [
            "NCT02658955"
          ],
          "statusText": "CT.gov: kept 15 trials after applying the 2015+ floor"
        },
        "openalex": {
          "anchorRecall": 0.3333333333333333,
          "count": 20,
          "eligible": 3,
          "firstResult": {
            "doi": "10.1093/eurheartj/ehv320",
            "pmid": "22395108",
            "title": "2015 ESC Guidelines for the management of acute coronary syndromes in patients presenting without persistent ST-segment elevation",
            "year": "2015"
          },
          "matched": [
            "NCT02658955"
          ],
          "statusText": "OpenAlex: kept 20 records after applying the 2015+ floor"
        },
        "pubmed": {
          "anchorRecall": 0,
          "count": 20,
          "eligible": 3,
          "firstResult": {
            "doi": "10.3389/fcvm.2026.1731952",
            "pmid": "41815903",
            "title": "Drug-coated balloons in complex large-vessel coronary artery disease: a comprehensive review of current evidence and future perspectives.",
            "year": "2026"
          },
          "matched": [],
          "statusText": "2753 total results (PubMed: 20)"
        }
      },
      "status": "warn",
      "topicId": "short_dapt_pci_high_bleeding_risk",
      "validationPackId": "pairwise70_cardio",
      "id": "short_dapt_pci_high_bleeding_risk",
      "pack": {
        "id": "pairwise70_cardio",
        "meta": {
          "counts": {
            "error": 0,
            "fail": 0,
            "pass": 45,
            "passRate": 100,
            "prepared": 45
          },
          "date": "2026-02-27",
          "id": "pairwise70_cardio",
          "name": "Pairwise70 Cardio End-to-End",
          "sourcePath": "validation/reports/pairwise70_cardio_benchmark/pairwise70_cardio_end_to_end_report.json",
          "summary": "45/45 prepared cardiovascular datasets passed using ClinicalTrials.gov, PubMed, and OpenAlex only, with no PDF extraction pipeline.",
          "tier": "domain",
          "verdict": "PASS"
        },
        "report_summary": {
          "scope": {
            "domain": "cardiovascular",
            "design": "RCT-focused Pairwise70 Cochrane study-level",
            "sources": [
              "ClinicalTrials.gov",
              "AACT",
              "PubMed",
              "OpenAlex"
            ],
            "pdf_pipeline_used": false
          },
          "counts": {
            "cardio_review_ids": 52,
            "cardio_dataset_files": 47,
            "prepared_datasets": 45,
            "skipped_datasets": 2,
            "pass": 45,
            "fail": 0,
            "error": 0,
            "pass_rate": 100.0
          },
          "elapsed_seconds": 9.37
        }
      }
    },
    {
      "category": "Atrial Fibrillation",
      "extraction": {
        "ctgov": {
          "has2x2": false,
          "hasReportedEffect": false,
          "hasResults": true,
          "matchScore": 63,
          "matchedOutcome": "Number of Participants With Adjudicated Major or Clinically Relevant Non-major Bleeding As First Event Defined by International Society on Thrombosis and Haemostasis Following Edoxaban-based Regimen Compared With Vitamin K Antagonist (VKA)-Based Regimen",
          "recordExtract": "Number of Participants With Adjudicated Major or Clinically Relevant Non-major Bleeding As First Event Defined by International Society on Thrombosis and Haemostasis Following Edoxaban-based Regimen Compared With Vitamin K Antagonist (VKA)-Based Regimen | Tx --/-- vs Ctrl --/--",
          "sampleNctId": "NCT02866175",
          "success": false
        },
        "pubmed": {
          "effectCount": 3,
          "firstExtract": "RR: 0.83; 95% CI: 0.58-1.20",
          "pmid": "39918467",
          "success": true,
          "title": "Antithrombotic Therapy to Minimize\u00a0Total Events After ACS\u00a0or\u00a0PCI\u00a0in\u00a0Atrial Fibrillation: Insights From AUGUSTUS."
        }
      },
      "failReasons": [
        "ctgov_extract"
      ],
      "name": "DOAC-based dual therapy in AF-PCI - Bleeding",
      "policy": {
        "allowedSources": [
          "ctgov",
          "pubmed",
          "openalex"
        ],
        "extractionMode": "pubmed-abstract-and-ctgov-records-only",
        "pass": true,
        "pdfUploadHidden": true,
        "pdfViewerHidden": true,
        "yearFloor": 2015
      },
      "screening": {
        "humanCheckable": true,
        "recordsWithAnchors": 3
      },
      "search": {
        "ctgov": {
          "anchorRecall": 0.75,
          "count": 16,
          "eligible": 4,
          "firstResult": {
            "nctId": "NCT04151680",
            "title": "Safety and Efficacy of Anticoagulation on Demand After Percutaneous Coronary Intervention in High Bleeding Risk (HBR) Patients With History of Paroxysmal Atrial Fibrillation",
            "year": "2019"
          },
          "matched": [
            "NCT02164864",
            "NCT02415400",
            "NCT02866175"
          ],
          "statusText": "CT.gov: kept 16 trials after applying the 2015+ floor"
        },
        "openalex": {
          "anchorRecall": 0,
          "count": 20,
          "eligible": 4,
          "firstResult": {
            "doi": "10.1161/cir.0000000000001193",
            "pmid": "38033089",
            "title": "2023 ACC/AHA/ACCP/HRS Guideline for the Diagnosis and Management of Atrial Fibrillation: A Report of the American College of Cardiology/American Heart Association Joint Committee on Clinical Practice Guidelines",
            "year": "2023"
          },
          "matched": [],
          "statusText": "OpenAlex: kept 20 records after applying the 2015+ floor"
        },
        "pubmed": {
          "anchorRecall": 0.25,
          "count": 20,
          "eligible": 4,
          "firstResult": {
            "doi": "10.1186/s12916-025-04477-1",
            "nctId": "NCT03536611",
            "pmid": "41254594",
            "title": "Dabigatran-based versus warfarin-based triple antithrombotic regimen with a 1-month intensification after coronary stenting in patients with nonvalvular atrial fibrillation (COACH-AF PCI).",
            "year": "2025"
          },
          "matched": [
            "NCT02415400"
          ],
          "statusText": "2809 total results (PubMed: 20)"
        }
      },
      "status": "warn",
      "topicId": "af_pci_dual_therapy_bleeding",
      "validationPackId": "pairwise70_cardio",
      "id": "af_pci_dual_therapy_bleeding",
      "pack": {
        "id": "pairwise70_cardio",
        "meta": {
          "counts": {
            "error": 0,
            "fail": 0,
            "pass": 45,
            "passRate": 100,
            "prepared": 45
          },
          "date": "2026-02-27",
          "id": "pairwise70_cardio",
          "name": "Pairwise70 Cardio End-to-End",
          "sourcePath": "validation/reports/pairwise70_cardio_benchmark/pairwise70_cardio_end_to_end_report.json",
          "summary": "45/45 prepared cardiovascular datasets passed using ClinicalTrials.gov, PubMed, and OpenAlex only, with no PDF extraction pipeline.",
          "tier": "domain",
          "verdict": "PASS"
        },
        "report_summary": {
          "scope": {
            "domain": "cardiovascular",
            "design": "RCT-focused Pairwise70 Cochrane study-level",
            "sources": [
              "ClinicalTrials.gov",
              "AACT",
              "PubMed",
              "OpenAlex"
            ],
            "pdf_pipeline_used": false
          },
          "counts": {
            "cardio_review_ids": 52,
            "cardio_dataset_files": 47,
            "prepared_datasets": 45,
            "skipped_datasets": 2,
            "pass": 45,
            "fail": 0,
            "error": 0,
            "pass_rate": 100.0
          },
          "elapsed_seconds": 9.37
        }
      }
    },
    {
      "category": "Atrial Fibrillation",
      "extraction": {
        "ctgov": {
          "has2x2": false,
          "hasReportedEffect": false,
          "hasResults": true,
          "matchScore": 45,
          "matchedOutcome": "Number of Participants With Adjudicated Major, Minor, and Minimal Bleeding by Thrombolysis in Myocardial Infarction (TIMI) Definition Following Edoxaban-based Regimen Compared With Vitamin K Antagonist (VKA)-Based Regimen",
          "recordExtract": "Number of Participants With Adjudicated Major, Minor, and Minimal Bleeding by Thrombolysis in Myocardial Infarction (TIMI) Definition Following Edoxaban-based Regimen Compared With Vitamin K Antagonist (VKA)-Based Regimen | Tx --/-- vs Ctrl --/--",
          "sampleNctId": "NCT02866175",
          "success": false
        },
        "pubmed": {
          "effectCount": 3,
          "firstExtract": "RR: 0.83; 95% CI: 0.58-1.20",
          "pmid": "39918467",
          "success": true,
          "title": "Antithrombotic Therapy to Minimize\u00a0Total Events After ACS\u00a0or\u00a0PCI\u00a0in\u00a0Atrial Fibrillation: Insights From AUGUSTUS."
        }
      },
      "failReasons": [
        "ctgov_extract"
      ],
      "name": "DOAC-based dual therapy in AF-PCI - Ischemic events",
      "policy": {
        "allowedSources": [
          "ctgov",
          "pubmed",
          "openalex"
        ],
        "extractionMode": "pubmed-abstract-and-ctgov-records-only",
        "pass": true,
        "pdfUploadHidden": true,
        "pdfViewerHidden": true,
        "yearFloor": 2015
      },
      "screening": {
        "humanCheckable": true,
        "recordsWithAnchors": 3
      },
      "search": {
        "ctgov": {
          "anchorRecall": 0.75,
          "count": 16,
          "eligible": 4,
          "firstResult": {
            "nctId": "NCT04151680",
            "title": "Safety and Efficacy of Anticoagulation on Demand After Percutaneous Coronary Intervention in High Bleeding Risk (HBR) Patients With History of Paroxysmal Atrial Fibrillation",
            "year": "2019"
          },
          "matched": [
            "NCT02164864",
            "NCT02415400",
            "NCT02866175"
          ],
          "statusText": "CT.gov: kept 16 trials after applying the 2015+ floor"
        },
        "openalex": {
          "anchorRecall": 0,
          "count": 20,
          "eligible": 4,
          "firstResult": {
            "doi": "10.1161/cir.0000000000001193",
            "pmid": "38033089",
            "title": "2023 ACC/AHA/ACCP/HRS Guideline for the Diagnosis and Management of Atrial Fibrillation: A Report of the American College of Cardiology/American Heart Association Joint Committee on Clinical Practice Guidelines",
            "year": "2023"
          },
          "matched": [],
          "statusText": "OpenAlex: kept 20 records after applying the 2015+ floor"
        },
        "pubmed": {
          "anchorRecall": 0.25,
          "count": 20,
          "eligible": 4,
          "firstResult": {
            "doi": "10.1186/s12916-025-04477-1",
            "nctId": "NCT03536611",
            "pmid": "41254594",
            "title": "Dabigatran-based versus warfarin-based triple antithrombotic regimen with a 1-month intensification after coronary stenting in patients with nonvalvular atrial fibrillation (COACH-AF PCI).",
            "year": "2025"
          },
          "matched": [
            "NCT02415400"
          ],
          "statusText": "2865 total results (PubMed: 20)"
        }
      },
      "status": "warn",
      "topicId": "af_pci_dual_therapy_ischemic",
      "validationPackId": "pairwise70_cardio",
      "id": "af_pci_dual_therapy_ischemic",
      "pack": {
        "id": "pairwise70_cardio",
        "meta": {
          "counts": {
            "error": 0,
            "fail": 0,
            "pass": 45,
            "passRate": 100,
            "prepared": 45
          },
          "date": "2026-02-27",
          "id": "pairwise70_cardio",
          "name": "Pairwise70 Cardio End-to-End",
          "sourcePath": "validation/reports/pairwise70_cardio_benchmark/pairwise70_cardio_end_to_end_report.json",
          "summary": "45/45 prepared cardiovascular datasets passed using ClinicalTrials.gov, PubMed, and OpenAlex only, with no PDF extraction pipeline.",
          "tier": "domain",
          "verdict": "PASS"
        },
        "report_summary": {
          "scope": {
            "domain": "cardiovascular",
            "design": "RCT-focused Pairwise70 Cochrane study-level",
            "sources": [
              "ClinicalTrials.gov",
              "AACT",
              "PubMed",
              "OpenAlex"
            ],
            "pdf_pipeline_used": false
          },
          "counts": {
            "cardio_review_ids": 52,
            "cardio_dataset_files": 47,
            "prepared_datasets": 45,
            "skipped_datasets": 2,
            "pass": 45,
            "fail": 0,
            "error": 0,
            "pass_rate": 100.0
          },
          "elapsed_seconds": 9.37
        }
      }
    },
    {
      "category": "Atrial Fibrillation",
      "extraction": {
        "ctgov": {
          "has2x2": false,
          "hasReportedEffect": false,
          "hasResults": true,
          "matchScore": 15,
          "matchedOutcome": "Number of Participants With Adjudicated Major or Clinically Relevant Non-major Bleeding As First Event Defined by International Society on Thrombosis and Haemostasis Following Edoxaban-based Regimen Compared With Vitamin K Antagonist (VKA)-Based Regimen",
          "recordExtract": "Number of Participants With Adjudicated Major or Clinically Relevant Non-major Bleeding As First Event Defined by International Society on Thrombosis and Haemostasis Following Edoxaban-based Regimen Compared With Vitamin K Antagonist (VKA)-Based Regimen | Tx --/-- vs Ctrl --/--",
          "sampleNctId": "NCT02866175",
          "success": false
        },
        "pubmed": {
          "effectCount": 3,
          "firstExtract": "RR: 0.83; 95% CI: 0.58-1.20",
          "pmid": "39918467",
          "success": true,
          "title": "Antithrombotic Therapy to Minimize\u00a0Total Events After ACS\u00a0or\u00a0PCI\u00a0in\u00a0Atrial Fibrillation: Insights From AUGUSTUS."
        }
      },
      "failReasons": [
        "ctgov_extract"
      ],
      "name": "DOAC-based dual therapy in AF-PCI - All-cause mortality",
      "policy": {
        "allowedSources": [
          "ctgov",
          "pubmed",
          "openalex"
        ],
        "extractionMode": "pubmed-abstract-and-ctgov-records-only",
        "pass": true,
        "pdfUploadHidden": true,
        "pdfViewerHidden": true,
        "yearFloor": 2015
      },
      "screening": {
        "humanCheckable": true,
        "recordsWithAnchors": 3
      },
      "search": {
        "ctgov": {
          "anchorRecall": 0.75,
          "count": 16,
          "eligible": 4,
          "firstResult": {
            "nctId": "NCT04151680",
            "title": "Safety and Efficacy of Anticoagulation on Demand After Percutaneous Coronary Intervention in High Bleeding Risk (HBR) Patients With History of Paroxysmal Atrial Fibrillation",
            "year": "2019"
          },
          "matched": [
            "NCT02164864",
            "NCT02415400",
            "NCT02866175"
          ],
          "statusText": "CT.gov: kept 16 trials after applying the 2015+ floor"
        },
        "openalex": {
          "anchorRecall": 0,
          "count": 20,
          "eligible": 4,
          "firstResult": {
            "doi": "10.1161/cir.0000000000001193",
            "pmid": "38033089",
            "title": "2023 ACC/AHA/ACCP/HRS Guideline for the Diagnosis and Management of Atrial Fibrillation: A Report of the American College of Cardiology/American Heart Association Joint Committee on Clinical Practice Guidelines",
            "year": "2023"
          },
          "matched": [],
          "statusText": "OpenAlex: kept 20 records after applying the 2015+ floor"
        },
        "pubmed": {
          "anchorRecall": 0.25,
          "count": 20,
          "eligible": 4,
          "firstResult": {
            "doi": "10.1186/s12916-025-04477-1",
            "nctId": "NCT03536611",
            "pmid": "41254594",
            "title": "Dabigatran-based versus warfarin-based triple antithrombotic regimen with a 1-month intensification after coronary stenting in patients with nonvalvular atrial fibrillation (COACH-AF PCI).",
            "year": "2025"
          },
          "matched": [
            "NCT02415400"
          ],
          "statusText": "2921 total results (PubMed: 20)"
        }
      },
      "status": "warn",
      "topicId": "af_pci_dual_therapy_mortality",
      "validationPackId": "pairwise70_cardio",
      "id": "af_pci_dual_therapy_mortality",
      "pack": {
        "id": "pairwise70_cardio",
        "meta": {
          "counts": {
            "error": 0,
            "fail": 0,
            "pass": 45,
            "passRate": 100,
            "prepared": 45
          },
          "date": "2026-02-27",
          "id": "pairwise70_cardio",
          "name": "Pairwise70 Cardio End-to-End",
          "sourcePath": "validation/reports/pairwise70_cardio_benchmark/pairwise70_cardio_end_to_end_report.json",
          "summary": "45/45 prepared cardiovascular datasets passed using ClinicalTrials.gov, PubMed, and OpenAlex only, with no PDF extraction pipeline.",
          "tier": "domain",
          "verdict": "PASS"
        },
        "report_summary": {
          "scope": {
            "domain": "cardiovascular",
            "design": "RCT-focused Pairwise70 Cochrane study-level",
            "sources": [
              "ClinicalTrials.gov",
              "AACT",
              "PubMed",
              "OpenAlex"
            ],
            "pdf_pipeline_used": false
          },
          "counts": {
            "cardio_review_ids": 52,
            "cardio_dataset_files": 47,
            "prepared_datasets": 45,
            "skipped_datasets": 2,
            "pass": 45,
            "fail": 0,
            "error": 0,
            "pass_rate": 100.0
          },
          "elapsed_seconds": 9.37
        }
      }
    },
    {
      "category": "Atherosclerosis and Inflammation",
      "extraction": {
        "ctgov": {
          "has2x2": false,
          "hasReportedEffect": false,
          "hasResults": true,
          "matchScore": 73,
          "matchedOutcome": "Primary Safety Outcome: Number of Participants With TIMI (Thrombolysis in Myocardial Infarction) Major Bleeding",
          "recordExtract": "Primary Safety Outcome: Number of Participants With TIMI (Thrombolysis in Myocardial Infarction) Major Bleeding | Tx --/-- vs Ctrl --/--",
          "sampleNctId": "NCT02504216",
          "success": false
        },
        "pubmed": {
          "effectCount": 2,
          "firstExtract": "HR, 0.73 [95% CI, 0.60-0.88]",
          "pmid": "41757414",
          "success": true,
          "title": "Low-Dose Rivaroxaban Plus Aspirin in Patients With PAD Undergoing Lower Extremity Revascularization With and Without History of Prior Limb Revascularization: Insight From the VOYAGER-PAD Trial."
        }
      },
      "failReasons": [
        "ctgov_extract"
      ],
      "name": "Dual-pathway inhibition in CAD/PAD - MACE",
      "policy": {
        "allowedSources": [
          "ctgov",
          "pubmed",
          "openalex"
        ],
        "extractionMode": "pubmed-abstract-and-ctgov-records-only",
        "pass": true,
        "pdfUploadHidden": true,
        "pdfViewerHidden": true,
        "yearFloor": 2015
      },
      "screening": {
        "humanCheckable": true,
        "recordsWithAnchors": 1
      },
      "search": {
        "ctgov": {
          "anchorRecall": 0.5,
          "count": 18,
          "eligible": 2,
          "firstResult": {
            "nctId": "NCT05122455",
            "title": "Effects of Edoxaban on Platelet Aggregation in Patients With Stable Coronary Artery Disease",
            "year": "2021"
          },
          "matched": [
            "NCT01776424"
          ],
          "statusText": "CT.gov: kept 18 trials after applying the 2015+ floor"
        },
        "openalex": {
          "anchorRecall": 1,
          "count": 20,
          "eligible": 2,
          "firstResult": {
            "doi": "10.1016/s0140-6736(17)32409-1",
            "title": "Rivaroxaban with or without aspirin in patients with stable peripheral or carotid artery disease: an international, randomised, double-blind, placebo-controlled trial",
            "year": "2017"
          },
          "matched": [
            "NCT01776424",
            "NCT02504216"
          ],
          "statusText": "OpenAlex: kept 20 records after applying the 2015+ floor"
        },
        "pubmed": {
          "anchorRecall": 1,
          "count": 20,
          "eligible": 2,
          "firstResult": {
            "doi": "10.2174/0115748871405002251201151146",
            "pmid": "41830579",
            "title": "Impacts of Rivaroxaban on Functional Outcomes in Patients with Lower-extremity Peripheral Artery Disease Following Endovascular Revascularization: A Randomized Double-blinded Controlled Trial.",
            "year": "2026"
          },
          "matched": [
            "NCT01776424",
            "NCT02504216"
          ],
          "statusText": "2979 total results (PubMed: 20)"
        }
      },
      "status": "warn",
      "topicId": "dual_pathway_cad_pad_mace",
      "validationPackId": "pairwise70_cardio",
      "id": "dual_pathway_cad_pad_mace",
      "pack": {
        "id": "pairwise70_cardio",
        "meta": {
          "counts": {
            "error": 0,
            "fail": 0,
            "pass": 45,
            "passRate": 100,
            "prepared": 45
          },
          "date": "2026-02-27",
          "id": "pairwise70_cardio",
          "name": "Pairwise70 Cardio End-to-End",
          "sourcePath": "validation/reports/pairwise70_cardio_benchmark/pairwise70_cardio_end_to_end_report.json",
          "summary": "45/45 prepared cardiovascular datasets passed using ClinicalTrials.gov, PubMed, and OpenAlex only, with no PDF extraction pipeline.",
          "tier": "domain",
          "verdict": "PASS"
        },
        "report_summary": {
          "scope": {
            "domain": "cardiovascular",
            "design": "RCT-focused Pairwise70 Cochrane study-level",
            "sources": [
              "ClinicalTrials.gov",
              "AACT",
              "PubMed",
              "OpenAlex"
            ],
            "pdf_pipeline_used": false
          },
          "counts": {
            "cardio_review_ids": 52,
            "cardio_dataset_files": 47,
            "prepared_datasets": 45,
            "skipped_datasets": 2,
            "pass": 45,
            "fail": 0,
            "error": 0,
            "pass_rate": 100.0
          },
          "elapsed_seconds": 9.37
        }
      }
    },
    {
      "category": "Atherosclerosis and Inflammation",
      "extraction": {
        "ctgov": {
          "has2x2": false,
          "hasReportedEffect": false,
          "hasResults": true,
          "matchScore": 97,
          "matchedOutcome": "Primary Efficacy Outcome: Number of Participants With Composite of Myocardial Infarction (MI), Ischemic Stroke, Cardiovascular Death, Acute Limb Ischemia (ALI) and Major Amputation Due to a Vascular Etiology",
          "recordExtract": "Primary Efficacy Outcome: Number of Participants With Composite of Myocardial Infarction (MI), Ischemic Stroke, Cardiovascular Death, Acute Limb Ischemia (ALI) and Major Amputation Due to a Vascular Etiology | Tx --/-- vs Ctrl --/--",
          "sampleNctId": "NCT02504216",
          "success": false
        },
        "pubmed": {
          "effectCount": 2,
          "firstExtract": "HR, 0.73 [95% CI, 0.60-0.88]",
          "pmid": "41757414",
          "success": true,
          "title": "Low-Dose Rivaroxaban Plus Aspirin in Patients With PAD Undergoing Lower Extremity Revascularization With and Without History of Prior Limb Revascularization: Insight From the VOYAGER-PAD Trial."
        }
      },
      "failReasons": [
        "ctgov_extract"
      ],
      "name": "Dual-pathway inhibition in CAD/PAD - Limb outcomes",
      "policy": {
        "allowedSources": [
          "ctgov",
          "pubmed",
          "openalex"
        ],
        "extractionMode": "pubmed-abstract-and-ctgov-records-only",
        "pass": true,
        "pdfUploadHidden": true,
        "pdfViewerHidden": true,
        "yearFloor": 2015
      },
      "screening": {
        "humanCheckable": true,
        "recordsWithAnchors": 1
      },
      "search": {
        "ctgov": {
          "anchorRecall": 0.5,
          "count": 18,
          "eligible": 2,
          "firstResult": {
            "nctId": "NCT05122455",
            "title": "Effects of Edoxaban on Platelet Aggregation in Patients With Stable Coronary Artery Disease",
            "year": "2021"
          },
          "matched": [
            "NCT01776424"
          ],
          "statusText": "CT.gov: kept 18 trials after applying the 2015+ floor"
        },
        "openalex": {
          "anchorRecall": 1,
          "count": 20,
          "eligible": 2,
          "firstResult": {
            "doi": "10.1016/s0140-6736(17)32409-1",
            "title": "Rivaroxaban with or without aspirin in patients with stable peripheral or carotid artery disease: an international, randomised, double-blind, placebo-controlled trial",
            "year": "2017"
          },
          "matched": [
            "NCT01776424",
            "NCT02504216"
          ],
          "statusText": "OpenAlex: kept 20 records after applying the 2015+ floor"
        },
        "pubmed": {
          "anchorRecall": 1,
          "count": 20,
          "eligible": 2,
          "firstResult": {
            "doi": "10.2174/0115748871405002251201151146",
            "pmid": "41830579",
            "title": "Impacts of Rivaroxaban on Functional Outcomes in Patients with Lower-extremity Peripheral Artery Disease Following Endovascular Revascularization: A Randomized Double-blinded Controlled Trial.",
            "year": "2026"
          },
          "matched": [
            "NCT01776424",
            "NCT02504216"
          ],
          "statusText": "3037 total results (PubMed: 20)"
        }
      },
      "status": "warn",
      "topicId": "dual_pathway_cad_pad_limb",
      "validationPackId": "pairwise70_cardio",
      "id": "dual_pathway_cad_pad_limb",
      "pack": {
        "id": "pairwise70_cardio",
        "meta": {
          "counts": {
            "error": 0,
            "fail": 0,
            "pass": 45,
            "passRate": 100,
            "prepared": 45
          },
          "date": "2026-02-27",
          "id": "pairwise70_cardio",
          "name": "Pairwise70 Cardio End-to-End",
          "sourcePath": "validation/reports/pairwise70_cardio_benchmark/pairwise70_cardio_end_to_end_report.json",
          "summary": "45/45 prepared cardiovascular datasets passed using ClinicalTrials.gov, PubMed, and OpenAlex only, with no PDF extraction pipeline.",
          "tier": "domain",
          "verdict": "PASS"
        },
        "report_summary": {
          "scope": {
            "domain": "cardiovascular",
            "design": "RCT-focused Pairwise70 Cochrane study-level",
            "sources": [
              "ClinicalTrials.gov",
              "AACT",
              "PubMed",
              "OpenAlex"
            ],
            "pdf_pipeline_used": false
          },
          "counts": {
            "cardio_review_ids": 52,
            "cardio_dataset_files": 47,
            "prepared_datasets": 45,
            "skipped_datasets": 2,
            "pass": 45,
            "fail": 0,
            "error": 0,
            "pass_rate": 100.0
          },
          "elapsed_seconds": 9.37
        }
      }
    },
    {
      "category": "Atherosclerosis and Inflammation",
      "extraction": {
        "ctgov": {
          "has2x2": false,
          "hasReportedEffect": false,
          "hasResults": true,
          "matchScore": 49,
          "matchedOutcome": "Primary Safety Outcome: Number of Participants With TIMI (Thrombolysis in Myocardial Infarction) Major Bleeding",
          "recordExtract": "Primary Safety Outcome: Number of Participants With TIMI (Thrombolysis in Myocardial Infarction) Major Bleeding | Tx --/-- vs Ctrl --/--",
          "sampleNctId": "NCT02504216",
          "success": false
        },
        "pubmed": {
          "effectCount": 2,
          "firstExtract": "HR, 0.73 [95% CI, 0.60-0.88]",
          "pmid": "41757414",
          "success": true,
          "title": "Low-Dose Rivaroxaban Plus Aspirin in Patients With PAD Undergoing Lower Extremity Revascularization With and Without History of Prior Limb Revascularization: Insight From the VOYAGER-PAD Trial."
        }
      },
      "failReasons": [
        "ctgov_extract"
      ],
      "name": "Dual-pathway inhibition in CAD/PAD - Bleeding",
      "policy": {
        "allowedSources": [
          "ctgov",
          "pubmed",
          "openalex"
        ],
        "extractionMode": "pubmed-abstract-and-ctgov-records-only",
        "pass": true,
        "pdfUploadHidden": true,
        "pdfViewerHidden": true,
        "yearFloor": 2015
      },
      "screening": {
        "humanCheckable": true,
        "recordsWithAnchors": 1
      },
      "search": {
        "ctgov": {
          "anchorRecall": 0.5,
          "count": 18,
          "eligible": 2,
          "firstResult": {
            "nctId": "NCT05122455",
            "title": "Effects of Edoxaban on Platelet Aggregation in Patients With Stable Coronary Artery Disease",
            "year": "2021"
          },
          "matched": [
            "NCT01776424"
          ],
          "statusText": "CT.gov: kept 18 trials after applying the 2015+ floor"
        },
        "openalex": {
          "anchorRecall": 1,
          "count": 20,
          "eligible": 2,
          "firstResult": {
            "doi": "10.1016/s0140-6736(17)32409-1",
            "title": "Rivaroxaban with or without aspirin in patients with stable peripheral or carotid artery disease: an international, randomised, double-blind, placebo-controlled trial",
            "year": "2017"
          },
          "matched": [
            "NCT01776424",
            "NCT02504216"
          ],
          "statusText": "OpenAlex: kept 20 records after applying the 2015+ floor"
        },
        "pubmed": {
          "anchorRecall": 1,
          "count": 20,
          "eligible": 2,
          "firstResult": {
            "doi": "10.2174/0115748871405002251201151146",
            "pmid": "41830579",
            "title": "Impacts of Rivaroxaban on Functional Outcomes in Patients with Lower-extremity Peripheral Artery Disease Following Endovascular Revascularization: A Randomized Double-blinded Controlled Trial.",
            "year": "2026"
          },
          "matched": [
            "NCT01776424",
            "NCT02504216"
          ],
          "statusText": "3095 total results (PubMed: 20)"
        }
      },
      "status": "warn",
      "topicId": "dual_pathway_cad_pad_bleeding",
      "validationPackId": "pairwise70_cardio",
      "id": "dual_pathway_cad_pad_bleeding",
      "pack": {
        "id": "pairwise70_cardio",
        "meta": {
          "counts": {
            "error": 0,
            "fail": 0,
            "pass": 45,
            "passRate": 100,
            "prepared": 45
          },
          "date": "2026-02-27",
          "id": "pairwise70_cardio",
          "name": "Pairwise70 Cardio End-to-End",
          "sourcePath": "validation/reports/pairwise70_cardio_benchmark/pairwise70_cardio_end_to_end_report.json",
          "summary": "45/45 prepared cardiovascular datasets passed using ClinicalTrials.gov, PubMed, and OpenAlex only, with no PDF extraction pipeline.",
          "tier": "domain",
          "verdict": "PASS"
        },
        "report_summary": {
          "scope": {
            "domain": "cardiovascular",
            "design": "RCT-focused Pairwise70 Cochrane study-level",
            "sources": [
              "ClinicalTrials.gov",
              "AACT",
              "PubMed",
              "OpenAlex"
            ],
            "pdf_pipeline_used": false
          },
          "counts": {
            "cardio_review_ids": 52,
            "cardio_dataset_files": 47,
            "prepared_datasets": 45,
            "skipped_datasets": 2,
            "pass": 45,
            "fail": 0,
            "error": 0,
            "pass_rate": 100.0
          },
          "elapsed_seconds": 9.37
        }
      }
    },
    {
      "category": "Prevention",
      "extraction": {
        "ctgov": {
          "has2x2": false,
          "hasReportedEffect": false,
          "hasResults": false,
          "matchScore": 55,
          "matchedOutcome": "Time to the First Occurrence of the Individual Components of the Primary: Non-fatal MI, Total MI, Non-fatal Stroke, Total Stroke, Cardiovascular Death, UA and TIA",
          "recordExtract": "Time to the First Occurrence of the Individual Components of the Primary: Non-fatal MI, Total MI, Non-fatal Stroke, Total Stroke, Cardiovascular Death, UA and TIA | Tx --/-- vs Ctrl --/--",
          "sampleNctId": "NCT01038583",
          "success": false
        },
        "pubmed": {
          "effectCount": 1,
          "firstExtract": "HR, 0.91; 95% CI, 0.72-1.16",
          "pmid": "41091476",
          "success": true,
          "title": "Clonal Hematopoiesis and Cardiovascular Disease and Bleeding Risk and the Effectiveness of Aspirin."
        }
      },
      "failReasons": [
        "ctgov_anchor_recall",
        "ctgov_extract"
      ],
      "name": "Aspirin for primary prevention - MACE",
      "policy": {
        "allowedSources": [
          "ctgov",
          "pubmed",
          "openalex"
        ],
        "extractionMode": "pubmed-abstract-and-ctgov-records-only",
        "pass": true,
        "pdfUploadHidden": true,
        "pdfViewerHidden": true,
        "yearFloor": 2015
      },
      "screening": {
        "humanCheckable": true,
        "recordsWithAnchors": 0
      },
      "search": {
        "ctgov": {
          "anchorRecall": 0,
          "count": 8,
          "eligible": 3,
          "firstResult": {
            "nctId": "NCT02642419",
            "title": "Atrial Fibrillation and Ischemic Events With Rivaroxaban in Patients With Stable Coronary Artery Disease Study (AFIRE Study)",
            "year": "2015"
          },
          "matched": [],
          "statusText": "CT.gov: kept 8 trials after applying the 2015+ floor"
        },
        "openalex": {
          "anchorRecall": 0,
          "count": 20,
          "eligible": 3,
          "firstResult": {
            "doi": "10.1007/s10557-018-6802-1",
            "pmid": "29943364",
            "title": "Aspirin for Primary Prevention of Cardiovascular Disease and Renal Disease Progression in Chronic Kidney Disease Patients: a Multicenter Randomized Clinical Trial (AASER Study)",
            "year": "2018"
          },
          "matched": [],
          "statusText": "OpenAlex: kept 20 records after applying the 2015+ floor"
        },
        "pubmed": {
          "anchorRecall": 0.6666666666666666,
          "count": 20,
          "eligible": 3,
          "firstResult": {
            "doi": "10.1002/14651858.CD015266.pub2",
            "pmid": "41740630",
            "title": "Aspirin and other nonsteroidal anti-inflammatory drugs (NSAIDs) for preventing colorectal cancer and colorectal adenoma in the general population.",
            "year": "2026"
          },
          "matched": [
            "NCT00135226",
            "NCT01038583"
          ],
          "statusText": "3143 total results (PubMed: 20)"
        }
      },
      "status": "warn",
      "topicId": "aspirin_primary_prevention_mace",
      "validationPackId": "pairwise70_cardio",
      "id": "aspirin_primary_prevention_mace",
      "pack": {
        "id": "pairwise70_cardio",
        "meta": {
          "counts": {
            "error": 0,
            "fail": 0,
            "pass": 45,
            "passRate": 100,
            "prepared": 45
          },
          "date": "2026-02-27",
          "id": "pairwise70_cardio",
          "name": "Pairwise70 Cardio End-to-End",
          "sourcePath": "validation/reports/pairwise70_cardio_benchmark/pairwise70_cardio_end_to_end_report.json",
          "summary": "45/45 prepared cardiovascular datasets passed using ClinicalTrials.gov, PubMed, and OpenAlex only, with no PDF extraction pipeline.",
          "tier": "domain",
          "verdict": "PASS"
        },
        "report_summary": {
          "scope": {
            "domain": "cardiovascular",
            "design": "RCT-focused Pairwise70 Cochrane study-level",
            "sources": [
              "ClinicalTrials.gov",
              "AACT",
              "PubMed",
              "OpenAlex"
            ],
            "pdf_pipeline_used": false
          },
          "counts": {
            "cardio_review_ids": 52,
            "cardio_dataset_files": 47,
            "prepared_datasets": 45,
            "skipped_datasets": 2,
            "pass": 45,
            "fail": 0,
            "error": 0,
            "pass_rate": 100.0
          },
          "elapsed_seconds": 9.37
        }
      }
    },
    {
      "category": "Prevention",
      "extraction": {
        "ctgov": {
          "has2x2": false,
          "hasReportedEffect": false,
          "hasResults": false,
          "matchScore": 67,
          "matchedOutcome": "Time to the First Occurrence of the Individual Components of the Primary: Non-fatal MI, Total MI, Non-fatal Stroke, Total Stroke, Cardiovascular Death, UA and TIA",
          "recordExtract": "Time to the First Occurrence of the Individual Components of the Primary: Non-fatal MI, Total MI, Non-fatal Stroke, Total Stroke, Cardiovascular Death, UA and TIA | Tx --/-- vs Ctrl --/--",
          "sampleNctId": "NCT01038583",
          "success": false
        },
        "pubmed": {
          "effectCount": 1,
          "firstExtract": "HR, 0.91; 95% CI, 0.72-1.16",
          "pmid": "41091476",
          "success": true,
          "title": "Clonal Hematopoiesis and Cardiovascular Disease and Bleeding Risk and the Effectiveness of Aspirin."
        }
      },
      "failReasons": [
        "ctgov_anchor_recall",
        "ctgov_extract"
      ],
      "name": "Aspirin for primary prevention - Diabetes subgroup",
      "policy": {
        "allowedSources": [
          "ctgov",
          "pubmed",
          "openalex"
        ],
        "extractionMode": "pubmed-abstract-and-ctgov-records-only",
        "pass": true,
        "pdfUploadHidden": true,
        "pdfViewerHidden": true,
        "yearFloor": 2015
      },
      "screening": {
        "humanCheckable": true,
        "recordsWithAnchors": 0
      },
      "search": {
        "ctgov": {
          "anchorRecall": 0,
          "count": 8,
          "eligible": 3,
          "firstResult": {
            "nctId": "NCT02642419",
            "title": "Atrial Fibrillation and Ischemic Events With Rivaroxaban in Patients With Stable Coronary Artery Disease Study (AFIRE Study)",
            "year": "2015"
          },
          "matched": [],
          "statusText": "CT.gov: kept 8 trials after applying the 2015+ floor"
        },
        "openalex": {
          "anchorRecall": 0,
          "count": 20,
          "eligible": 3,
          "firstResult": {
            "doi": "10.1007/s10557-018-6802-1",
            "pmid": "29943364",
            "title": "Aspirin for Primary Prevention of Cardiovascular Disease and Renal Disease Progression in Chronic Kidney Disease Patients: a Multicenter Randomized Clinical Trial (AASER Study)",
            "year": "2018"
          },
          "matched": [],
          "statusText": "OpenAlex: kept 20 records after applying the 2015+ floor"
        },
        "pubmed": {
          "anchorRecall": 0.6666666666666666,
          "count": 20,
          "eligible": 3,
          "firstResult": {
            "doi": "10.1002/14651858.CD015266.pub2",
            "pmid": "41740630",
            "title": "Aspirin and other nonsteroidal anti-inflammatory drugs (NSAIDs) for preventing colorectal cancer and colorectal adenoma in the general population.",
            "year": "2026"
          },
          "matched": [
            "NCT00135226",
            "NCT01038583"
          ],
          "statusText": "3191 total results (PubMed: 20)"
        }
      },
      "status": "warn",
      "topicId": "aspirin_primary_prevention_diabetes",
      "validationPackId": "pairwise70_cardio",
      "id": "aspirin_primary_prevention_diabetes",
      "pack": {
        "id": "pairwise70_cardio",
        "meta": {
          "counts": {
            "error": 0,
            "fail": 0,
            "pass": 45,
            "passRate": 100,
            "prepared": 45
          },
          "date": "2026-02-27",
          "id": "pairwise70_cardio",
          "name": "Pairwise70 Cardio End-to-End",
          "sourcePath": "validation/reports/pairwise70_cardio_benchmark/pairwise70_cardio_end_to_end_report.json",
          "summary": "45/45 prepared cardiovascular datasets passed using ClinicalTrials.gov, PubMed, and OpenAlex only, with no PDF extraction pipeline.",
          "tier": "domain",
          "verdict": "PASS"
        },
        "report_summary": {
          "scope": {
            "domain": "cardiovascular",
            "design": "RCT-focused Pairwise70 Cochrane study-level",
            "sources": [
              "ClinicalTrials.gov",
              "AACT",
              "PubMed",
              "OpenAlex"
            ],
            "pdf_pipeline_used": false
          },
          "counts": {
            "cardio_review_ids": 52,
            "cardio_dataset_files": 47,
            "prepared_datasets": 45,
            "skipped_datasets": 2,
            "pass": 45,
            "fail": 0,
            "error": 0,
            "pass_rate": 100.0
          },
          "elapsed_seconds": 9.37
        }
      }
    },
    {
      "category": "Prevention",
      "extraction": {
        "ctgov": {
          "has2x2": false,
          "hasReportedEffect": false,
          "hasResults": true,
          "matchScore": 98,
          "matchedOutcome": "Major Cardiovascular Adverse Events (MACE)",
          "recordExtract": "Major Cardiovascular Adverse Events (MACE) | Tx --/-- vs Ctrl --/--",
          "sampleNctId": "NCT02596126",
          "success": false
        },
        "pubmed": {
          "effectCount": 2,
          "firstExtract": "RR=1.45 (95%CI: 1.18-1.78)",
          "pmid": "41646739",
          "success": true,
          "title": "A Randomized Feasibility Trial of a Multicomponent Quality Improvement Strategy for Chronic Care of Cardiovascular Diseases: Findings from the C-QIP Trial in India."
        }
      },
      "failReasons": [
        "ctgov_anchor_recall",
        "ctgov_extract"
      ],
      "name": "Cardiovascular polypill strategies - MACE",
      "policy": {
        "allowedSources": [
          "ctgov",
          "pubmed",
          "openalex"
        ],
        "extractionMode": "pubmed-abstract-and-ctgov-records-only",
        "pass": true,
        "pdfUploadHidden": true,
        "pdfViewerHidden": true,
        "yearFloor": 2015
      },
      "screening": {
        "humanCheckable": true,
        "recordsWithAnchors": 0
      },
      "search": {
        "ctgov": {
          "anchorRecall": 0,
          "count": 12,
          "eligible": 2,
          "firstResult": {
            "nctId": "NCT05476913",
            "title": "A Randomised Controlled Trial of the Effectiveness of Intermittent Surface Neuromuscular Stimulation Using the Geko\u2122 Device Compared With Intermittent Pneumatic Compression to Prevent Venous Thromboembolism in Immobile Acute Stroke Patients",
            "year": "2023"
          },
          "matched": [],
          "statusText": "CT.gov: kept 12 trials after applying the 2015+ floor"
        },
        "openalex": {
          "anchorRecall": 0.3333333333333333,
          "count": 20,
          "eligible": 3,
          "firstResult": {
            "nctId": "NCT01245608",
            "pmid": "26265520",
            "title": "PolyPill for Prevention of Cardiovascular Disease in an Urban Iranian Population with Special Focus on Nonalcoholic Steatohepatitis: A Pragmatic Randomized Controlled Trial within a Cohort (PolyIran - Liver) - Study Protocol.",
            "year": "2015"
          },
          "matched": [
            "POLYIRAN"
          ],
          "statusText": "OpenAlex: kept 20 records after applying the 2015+ floor"
        },
        "pubmed": {
          "anchorRecall": 0.3333333333333333,
          "count": 20,
          "eligible": 3,
          "firstResult": {
            "doi": "10.1007/s12325-026-03525-3",
            "nctId": "NCT03904693",
            "pmid": "41820779",
            "title": "Long-Term Treatment with Single-Tablet Combination of Macitentan and Tadalafil in Pulmonary Arterial Hypertension: Results from A DUE and Its Open-Label Period.",
            "year": "2026"
          },
          "matched": [
            "POLYIRAN"
          ],
          "statusText": "3243 total results (PubMed: 20)"
        }
      },
      "status": "warn",
      "topicId": "polypill_prevention_mace",
      "validationPackId": "pairwise70_cardio",
      "id": "polypill_prevention_mace",
      "pack": {
        "id": "pairwise70_cardio",
        "meta": {
          "counts": {
            "error": 0,
            "fail": 0,
            "pass": 45,
            "passRate": 100,
            "prepared": 45
          },
          "date": "2026-02-27",
          "id": "pairwise70_cardio",
          "name": "Pairwise70 Cardio End-to-End",
          "sourcePath": "validation/reports/pairwise70_cardio_benchmark/pairwise70_cardio_end_to_end_report.json",
          "summary": "45/45 prepared cardiovascular datasets passed using ClinicalTrials.gov, PubMed, and OpenAlex only, with no PDF extraction pipeline.",
          "tier": "domain",
          "verdict": "PASS"
        },
        "report_summary": {
          "scope": {
            "domain": "cardiovascular",
            "design": "RCT-focused Pairwise70 Cochrane study-level",
            "sources": [
              "ClinicalTrials.gov",
              "AACT",
              "PubMed",
              "OpenAlex"
            ],
            "pdf_pipeline_used": false
          },
          "counts": {
            "cardio_review_ids": 52,
            "cardio_dataset_files": 47,
            "prepared_datasets": 45,
            "skipped_datasets": 2,
            "pass": 45,
            "fail": 0,
            "error": 0,
            "pass_rate": 100.0
          },
          "elapsed_seconds": 9.37
        }
      }
    },
    {
      "category": "Prevention",
      "extraction": {
        "ctgov": {
          "has2x2": false,
          "hasReportedEffect": false,
          "hasResults": true,
          "matchScore": 15,
          "matchedOutcome": "Major Cardiovascular Adverse Events (MACE)",
          "recordExtract": "Major Cardiovascular Adverse Events (MACE) | Tx --/-- vs Ctrl --/--",
          "sampleNctId": "NCT02596126",
          "success": false
        },
        "pubmed": {
          "effectCount": 2,
          "firstExtract": "RR=1.45 (95%CI: 1.18-1.78)",
          "pmid": "41646739",
          "success": true,
          "title": "A Randomized Feasibility Trial of a Multicomponent Quality Improvement Strategy for Chronic Care of Cardiovascular Diseases: Findings from the C-QIP Trial in India."
        }
      },
      "failReasons": [
        "ctgov_anchor_recall",
        "ctgov_extract"
      ],
      "name": "Cardiovascular polypill strategies - Adherence",
      "policy": {
        "allowedSources": [
          "ctgov",
          "pubmed",
          "openalex"
        ],
        "extractionMode": "pubmed-abstract-and-ctgov-records-only",
        "pass": true,
        "pdfUploadHidden": true,
        "pdfViewerHidden": true,
        "yearFloor": 2015
      },
      "screening": {
        "humanCheckable": true,
        "recordsWithAnchors": 0
      },
      "search": {
        "ctgov": {
          "anchorRecall": 0,
          "count": 12,
          "eligible": 2,
          "firstResult": {
            "nctId": "NCT05476913",
            "title": "A Randomised Controlled Trial of the Effectiveness of Intermittent Surface Neuromuscular Stimulation Using the Geko\u2122 Device Compared With Intermittent Pneumatic Compression to Prevent Venous Thromboembolism in Immobile Acute Stroke Patients",
            "year": "2023"
          },
          "matched": [],
          "statusText": "CT.gov: kept 12 trials after applying the 2015+ floor"
        },
        "openalex": {
          "anchorRecall": 0.3333333333333333,
          "count": 20,
          "eligible": 3,
          "firstResult": {
            "nctId": "NCT01245608",
            "pmid": "26265520",
            "title": "PolyPill for Prevention of Cardiovascular Disease in an Urban Iranian Population with Special Focus on Nonalcoholic Steatohepatitis: A Pragmatic Randomized Controlled Trial within a Cohort (PolyIran - Liver) - Study Protocol.",
            "year": "2015"
          },
          "matched": [
            "POLYIRAN"
          ],
          "statusText": "OpenAlex: kept 20 records after applying the 2015+ floor"
        },
        "pubmed": {
          "anchorRecall": 0.3333333333333333,
          "count": 20,
          "eligible": 3,
          "firstResult": {
            "doi": "10.1007/s12325-026-03525-3",
            "nctId": "NCT03904693",
            "pmid": "41820779",
            "title": "Long-Term Treatment with Single-Tablet Combination of Macitentan and Tadalafil in Pulmonary Arterial Hypertension: Results from A DUE and Its Open-Label Period.",
            "year": "2026"
          },
          "matched": [
            "POLYIRAN"
          ],
          "statusText": "3295 total results (PubMed: 20)"
        }
      },
      "status": "warn",
      "topicId": "polypill_prevention_adherence",
      "validationPackId": "pairwise70_cardio",
      "id": "polypill_prevention_adherence",
      "pack": {
        "id": "pairwise70_cardio",
        "meta": {
          "counts": {
            "error": 0,
            "fail": 0,
            "pass": 45,
            "passRate": 100,
            "prepared": 45
          },
          "date": "2026-02-27",
          "id": "pairwise70_cardio",
          "name": "Pairwise70 Cardio End-to-End",
          "sourcePath": "validation/reports/pairwise70_cardio_benchmark/pairwise70_cardio_end_to_end_report.json",
          "summary": "45/45 prepared cardiovascular datasets passed using ClinicalTrials.gov, PubMed, and OpenAlex only, with no PDF extraction pipeline.",
          "tier": "domain",
          "verdict": "PASS"
        },
        "report_summary": {
          "scope": {
            "domain": "cardiovascular",
            "design": "RCT-focused Pairwise70 Cochrane study-level",
            "sources": [
              "ClinicalTrials.gov",
              "AACT",
              "PubMed",
              "OpenAlex"
            ],
            "pdf_pipeline_used": false
          },
          "counts": {
            "cardio_review_ids": 52,
            "cardio_dataset_files": 47,
            "prepared_datasets": 45,
            "skipped_datasets": 2,
            "pass": 45,
            "fail": 0,
            "error": 0,
            "pass_rate": 100.0
          },
          "elapsed_seconds": 9.37
        }
      }
    },
    {
      "category": "Obesity and Metabolism",
      "extraction": {
        "ctgov": {
          "has2x2": false,
          "hasReportedEffect": false,
          "hasResults": true,
          "matchScore": 39,
          "matchedOutcome": "Percentage of Participants With \u226550% AHI Reduction From Baseline",
          "recordExtract": "Percentage of Participants With \u226550% AHI Reduction From Baseline | Tx --/-- vs Ctrl --/--",
          "sampleNctId": "NCT05412004",
          "success": false
        },
        "pubmed": {
          "effectCount": 1,
          "firstExtract": "odds ratio: 11.37 (95% confidence interval: 8.10-15.98",
          "pmid": "41824845",
          "success": true,
          "title": "GLP-1 receptor agonists for weight loss: A systematic review and meta-analysis of randomized controlled trials."
        }
      },
      "failReasons": [
        "ctgov_extract"
      ],
      "name": "Semaglutide and tirzepatide in obesity - Weight loss",
      "policy": {
        "allowedSources": [
          "ctgov",
          "pubmed",
          "openalex"
        ],
        "extractionMode": "pubmed-abstract-and-ctgov-records-only",
        "pass": true,
        "pdfUploadHidden": true,
        "pdfViewerHidden": true,
        "yearFloor": 2015
      },
      "screening": {
        "humanCheckable": true,
        "recordsWithAnchors": 1
      },
      "search": {
        "ctgov": {
          "anchorRecall": 0.2,
          "count": 20,
          "eligible": 5,
          "firstResult": {
            "nctId": "NCT07139405",
            "title": "A DOUBLE-BLIND, RANDOMIZED, ACTIVE-CONTROLLED, PARALLEL-GROUP, PHASE II TRIAL TO EVALUATE THE SAFETY, TOLERABILITY, AND SUPERIORITY OF TRIGLYTZA\u00ae OVER METFORMIN IN PATIENTS WITH INADEQUATE GLYCEMIC CONTROL OVER 24 WEEKS OF TREATMENT",
            "year": "2026"
          },
          "matched": [
            "NCT03574597"
          ],
          "statusText": "CT.gov: kept 20 trials after applying the 2015+ floor"
        },
        "openalex": {
          "anchorRecall": 0.8,
          "count": 20,
          "eligible": 5,
          "firstResult": {
            "doi": "10.1093/gastro/goae029",
            "pmid": "38681750",
            "title": "Advancements in pharmacological treatment of NAFLD/MASLD: a focus on metabolic and liver-targeted interventions",
            "year": "2023"
          },
          "matched": [
            "NCT03548935",
            "NCT04184622",
            "NCT03574597",
            "NCT05412004"
          ],
          "statusText": "OpenAlex: kept 20 records after applying the 2015+ floor"
        },
        "pubmed": {
          "anchorRecall": 0.4,
          "count": 20,
          "eligible": 5,
          "firstResult": {
            "doi": "10.1097/MD.0000000000047994",
            "pmid": "41824845",
            "title": "GLP-1 receptor agonists for weight loss: A systematic review and meta-analysis of randomized controlled trials.",
            "year": "2026"
          },
          "matched": [
            "NCT03548935",
            "NCT03574597"
          ],
          "statusText": "3355 total results (PubMed: 20)"
        }
      },
      "status": "warn",
      "topicId": "obesity_incretins_weight",
      "validationPackId": "pairwise70_cardio",
      "id": "obesity_incretins_weight",
      "pack": {
        "id": "pairwise70_cardio",
        "meta": {
          "counts": {
            "error": 0,
            "fail": 0,
            "pass": 45,
            "passRate": 100,
            "prepared": 45
          },
          "date": "2026-02-27",
          "id": "pairwise70_cardio",
          "name": "Pairwise70 Cardio End-to-End",
          "sourcePath": "validation/reports/pairwise70_cardio_benchmark/pairwise70_cardio_end_to_end_report.json",
          "summary": "45/45 prepared cardiovascular datasets passed using ClinicalTrials.gov, PubMed, and OpenAlex only, with no PDF extraction pipeline.",
          "tier": "domain",
          "verdict": "PASS"
        },
        "report_summary": {
          "scope": {
            "domain": "cardiovascular",
            "design": "RCT-focused Pairwise70 Cochrane study-level",
            "sources": [
              "ClinicalTrials.gov",
              "AACT",
              "PubMed",
              "OpenAlex"
            ],
            "pdf_pipeline_used": false
          },
          "counts": {
            "cardio_review_ids": 52,
            "cardio_dataset_files": 47,
            "prepared_datasets": 45,
            "skipped_datasets": 2,
            "pass": 45,
            "fail": 0,
            "error": 0,
            "pass_rate": 100.0
          },
          "elapsed_seconds": 9.37
        }
      }
    },
    {
      "category": "Obesity and Metabolism",
      "extraction": {
        "ctgov": {
          "has2x2": false,
          "hasReportedEffect": false,
          "hasResults": true,
          "matchScore": 27,
          "matchedOutcome": "Change From Baseline in Patient-Reported Outcomes Measurement Information System (PROMIS) Short Form Sleep-Related Impairment 8a (PROMIS SRI) and PROMIS Short Form Sleep Disturbance 8b (PROMIS SD)",
          "recordExtract": "Change From Baseline in Patient-Reported Outcomes Measurement Information System (PROMIS) Short Form Sleep-Related Impairment 8a (PROMIS SRI) and PROMIS Short Form Sleep Disturbance 8b (PROMIS SD) | Tx --/-- vs Ctrl --/--",
          "sampleNctId": "NCT05412004",
          "success": false
        },
        "pubmed": {
          "effectCount": 1,
          "firstExtract": "odds ratio: 11.37 (95% confidence interval: 8.10-15.98",
          "pmid": "41824845",
          "success": true,
          "title": "GLP-1 receptor agonists for weight loss: A systematic review and meta-analysis of randomized controlled trials."
        }
      },
      "failReasons": [
        "ctgov_extract"
      ],
      "name": "Semaglutide and tirzepatide in obesity - MACE",
      "policy": {
        "allowedSources": [
          "ctgov",
          "pubmed",
          "openalex"
        ],
        "extractionMode": "pubmed-abstract-and-ctgov-records-only",
        "pass": true,
        "pdfUploadHidden": true,
        "pdfViewerHidden": true,
        "yearFloor": 2015
      },
      "screening": {
        "humanCheckable": true,
        "recordsWithAnchors": 1
      },
      "search": {
        "ctgov": {
          "anchorRecall": 0.2,
          "count": 20,
          "eligible": 5,
          "firstResult": {
            "nctId": "NCT07139405",
            "title": "A DOUBLE-BLIND, RANDOMIZED, ACTIVE-CONTROLLED, PARALLEL-GROUP, PHASE II TRIAL TO EVALUATE THE SAFETY, TOLERABILITY, AND SUPERIORITY OF TRIGLYTZA\u00ae OVER METFORMIN IN PATIENTS WITH INADEQUATE GLYCEMIC CONTROL OVER 24 WEEKS OF TREATMENT",
            "year": "2026"
          },
          "matched": [
            "NCT03574597"
          ],
          "statusText": "CT.gov: kept 20 trials after applying the 2015+ floor"
        },
        "openalex": {
          "anchorRecall": 0.8,
          "count": 20,
          "eligible": 5,
          "firstResult": {
            "doi": "10.1093/gastro/goae029",
            "pmid": "38681750",
            "title": "Advancements in pharmacological treatment of NAFLD/MASLD: a focus on metabolic and liver-targeted interventions",
            "year": "2023"
          },
          "matched": [
            "NCT03548935",
            "NCT04184622",
            "NCT03574597",
            "NCT05412004"
          ],
          "statusText": "OpenAlex: kept 20 records after applying the 2015+ floor"
        },
        "pubmed": {
          "anchorRecall": 0.4,
          "count": 20,
          "eligible": 5,
          "firstResult": {
            "doi": "10.1097/MD.0000000000047994",
            "pmid": "41824845",
            "title": "GLP-1 receptor agonists for weight loss: A systematic review and meta-analysis of randomized controlled trials.",
            "year": "2026"
          },
          "matched": [
            "NCT03548935",
            "NCT03574597"
          ],
          "statusText": "3415 total results (PubMed: 20)"
        }
      },
      "status": "warn",
      "topicId": "obesity_incretins_mace",
      "validationPackId": "pairwise70_cardio",
      "id": "obesity_incretins_mace",
      "pack": {
        "id": "pairwise70_cardio",
        "meta": {
          "counts": {
            "error": 0,
            "fail": 0,
            "pass": 45,
            "passRate": 100,
            "prepared": 45
          },
          "date": "2026-02-27",
          "id": "pairwise70_cardio",
          "name": "Pairwise70 Cardio End-to-End",
          "sourcePath": "validation/reports/pairwise70_cardio_benchmark/pairwise70_cardio_end_to_end_report.json",
          "summary": "45/45 prepared cardiovascular datasets passed using ClinicalTrials.gov, PubMed, and OpenAlex only, with no PDF extraction pipeline.",
          "tier": "domain",
          "verdict": "PASS"
        },
        "report_summary": {
          "scope": {
            "domain": "cardiovascular",
            "design": "RCT-focused Pairwise70 Cochrane study-level",
            "sources": [
              "ClinicalTrials.gov",
              "AACT",
              "PubMed",
              "OpenAlex"
            ],
            "pdf_pipeline_used": false
          },
          "counts": {
            "cardio_review_ids": 52,
            "cardio_dataset_files": 47,
            "prepared_datasets": 45,
            "skipped_datasets": 2,
            "pass": 45,
            "fail": 0,
            "error": 0,
            "pass_rate": 100.0
          },
          "elapsed_seconds": 9.37
        }
      }
    },
    {
      "category": "Obesity and Metabolism",
      "extraction": {
        "ctgov": {
          "has2x2": false,
          "hasReportedEffect": false,
          "hasResults": true,
          "matchScore": 39,
          "matchedOutcome": "Change From Baseline in Sleep Apnea-Specific Hypoxic Burden (SASHB) (% Min/Hour)",
          "recordExtract": "Change From Baseline in Sleep Apnea-Specific Hypoxic Burden (SASHB) (% Min/Hour) | Tx --/-- vs Ctrl --/--",
          "sampleNctId": "NCT05412004",
          "success": false
        },
        "pubmed": {
          "effectCount": 1,
          "firstExtract": "odds ratio: 11.37 (95% confidence interval: 8.10-15.98",
          "pmid": "41824845",
          "success": true,
          "title": "GLP-1 receptor agonists for weight loss: A systematic review and meta-analysis of randomized controlled trials."
        }
      },
      "failReasons": [
        "ctgov_extract"
      ],
      "name": "Semaglutide and tirzepatide in obesity - Sleep apnea",
      "policy": {
        "allowedSources": [
          "ctgov",
          "pubmed",
          "openalex"
        ],
        "extractionMode": "pubmed-abstract-and-ctgov-records-only",
        "pass": true,
        "pdfUploadHidden": true,
        "pdfViewerHidden": true,
        "yearFloor": 2015
      },
      "screening": {
        "humanCheckable": true,
        "recordsWithAnchors": 1
      },
      "search": {
        "ctgov": {
          "anchorRecall": 0.2,
          "count": 20,
          "eligible": 5,
          "firstResult": {
            "nctId": "NCT07139405",
            "title": "A DOUBLE-BLIND, RANDOMIZED, ACTIVE-CONTROLLED, PARALLEL-GROUP, PHASE II TRIAL TO EVALUATE THE SAFETY, TOLERABILITY, AND SUPERIORITY OF TRIGLYTZA\u00ae OVER METFORMIN IN PATIENTS WITH INADEQUATE GLYCEMIC CONTROL OVER 24 WEEKS OF TREATMENT",
            "year": "2026"
          },
          "matched": [
            "NCT03574597"
          ],
          "statusText": "CT.gov: kept 20 trials after applying the 2015+ floor"
        },
        "openalex": {
          "anchorRecall": 0.8,
          "count": 20,
          "eligible": 5,
          "firstResult": {
            "doi": "10.1093/gastro/goae029",
            "pmid": "38681750",
            "title": "Advancements in pharmacological treatment of NAFLD/MASLD: a focus on metabolic and liver-targeted interventions",
            "year": "2023"
          },
          "matched": [
            "NCT03548935",
            "NCT04184622",
            "NCT03574597",
            "NCT05412004"
          ],
          "statusText": "OpenAlex: kept 20 records after applying the 2015+ floor"
        },
        "pubmed": {
          "anchorRecall": 0.4,
          "count": 20,
          "eligible": 5,
          "firstResult": {
            "doi": "10.1097/MD.0000000000047994",
            "pmid": "41824845",
            "title": "GLP-1 receptor agonists for weight loss: A systematic review and meta-analysis of randomized controlled trials.",
            "year": "2026"
          },
          "matched": [
            "NCT03548935",
            "NCT03574597"
          ],
          "statusText": "3475 total results (PubMed: 20)"
        }
      },
      "status": "warn",
      "topicId": "obesity_incretins_sleep_apnea",
      "validationPackId": "pairwise70_cardio",
      "id": "obesity_incretins_sleep_apnea",
      "pack": {
        "id": "pairwise70_cardio",
        "meta": {
          "counts": {
            "error": 0,
            "fail": 0,
            "pass": 45,
            "passRate": 100,
            "prepared": 45
          },
          "date": "2026-02-27",
          "id": "pairwise70_cardio",
          "name": "Pairwise70 Cardio End-to-End",
          "sourcePath": "validation/reports/pairwise70_cardio_benchmark/pairwise70_cardio_end_to_end_report.json",
          "summary": "45/45 prepared cardiovascular datasets passed using ClinicalTrials.gov, PubMed, and OpenAlex only, with no PDF extraction pipeline.",
          "tier": "domain",
          "verdict": "PASS"
        },
        "report_summary": {
          "scope": {
            "domain": "cardiovascular",
            "design": "RCT-focused Pairwise70 Cochrane study-level",
            "sources": [
              "ClinicalTrials.gov",
              "AACT",
              "PubMed",
              "OpenAlex"
            ],
            "pdf_pipeline_used": false
          },
          "counts": {
            "cardio_review_ids": 52,
            "cardio_dataset_files": 47,
            "prepared_datasets": 45,
            "skipped_datasets": 2,
            "pass": 45,
            "fail": 0,
            "error": 0,
            "pass_rate": 100.0
          },
          "elapsed_seconds": 9.37
        }
      }
    },
    {
      "category": "Obesity and Metabolism",
      "extraction": {
        "ctgov": {
          "has2x2": false,
          "hasReportedEffect": false,
          "hasResults": true,
          "matchScore": 15,
          "matchedOutcome": "Change From Baseline in Apnea-Hypopnea Index (AHI)",
          "recordExtract": "Change From Baseline in Apnea-Hypopnea Index (AHI) | Tx --/-- vs Ctrl --/--",
          "sampleNctId": "NCT05412004",
          "success": false
        },
        "pubmed": {
          "effectCount": 1,
          "firstExtract": "odds ratio: 11.37 (95% confidence interval: 8.10-15.98",
          "pmid": "41824845",
          "success": true,
          "title": "GLP-1 receptor agonists for weight loss: A systematic review and meta-analysis of randomized controlled trials."
        }
      },
      "failReasons": [
        "ctgov_extract"
      ],
      "name": "Semaglutide and tirzepatide in obesity - Quality of life",
      "policy": {
        "allowedSources": [
          "ctgov",
          "pubmed",
          "openalex"
        ],
        "extractionMode": "pubmed-abstract-and-ctgov-records-only",
        "pass": true,
        "pdfUploadHidden": true,
        "pdfViewerHidden": true,
        "yearFloor": 2015
      },
      "screening": {
        "humanCheckable": true,
        "recordsWithAnchors": 1
      },
      "search": {
        "ctgov": {
          "anchorRecall": 0.2,
          "count": 20,
          "eligible": 5,
          "firstResult": {
            "nctId": "NCT07139405",
            "title": "A DOUBLE-BLIND, RANDOMIZED, ACTIVE-CONTROLLED, PARALLEL-GROUP, PHASE II TRIAL TO EVALUATE THE SAFETY, TOLERABILITY, AND SUPERIORITY OF TRIGLYTZA\u00ae OVER METFORMIN IN PATIENTS WITH INADEQUATE GLYCEMIC CONTROL OVER 24 WEEKS OF TREATMENT",
            "year": "2026"
          },
          "matched": [
            "NCT03574597"
          ],
          "statusText": "CT.gov: kept 20 trials after applying the 2015+ floor"
        },
        "openalex": {
          "anchorRecall": 0.8,
          "count": 20,
          "eligible": 5,
          "firstResult": {
            "doi": "10.1093/gastro/goae029",
            "pmid": "38681750",
            "title": "Advancements in pharmacological treatment of NAFLD/MASLD: a focus on metabolic and liver-targeted interventions",
            "year": "2023"
          },
          "matched": [
            "NCT03548935",
            "NCT04184622",
            "NCT03574597",
            "NCT05412004"
          ],
          "statusText": "OpenAlex: kept 20 records after applying the 2015+ floor"
        },
        "pubmed": {
          "anchorRecall": 0.4,
          "count": 20,
          "eligible": 5,
          "firstResult": {
            "doi": "10.1097/MD.0000000000047994",
            "pmid": "41824845",
            "title": "GLP-1 receptor agonists for weight loss: A systematic review and meta-analysis of randomized controlled trials.",
            "year": "2026"
          },
          "matched": [
            "NCT03548935",
            "NCT03574597"
          ],
          "statusText": "3535 total results (PubMed: 20)"
        }
      },
      "status": "warn",
      "topicId": "obesity_incretins_quality",
      "validationPackId": "pairwise70_cardio",
      "id": "obesity_incretins_quality",
      "pack": {
        "id": "pairwise70_cardio",
        "meta": {
          "counts": {
            "error": 0,
            "fail": 0,
            "pass": 45,
            "passRate": 100,
            "prepared": 45
          },
          "date": "2026-02-27",
          "id": "pairwise70_cardio",
          "name": "Pairwise70 Cardio End-to-End",
          "sourcePath": "validation/reports/pairwise70_cardio_benchmark/pairwise70_cardio_end_to_end_report.json",
          "summary": "45/45 prepared cardiovascular datasets passed using ClinicalTrials.gov, PubMed, and OpenAlex only, with no PDF extraction pipeline.",
          "tier": "domain",
          "verdict": "PASS"
        },
        "report_summary": {
          "scope": {
            "domain": "cardiovascular",
            "design": "RCT-focused Pairwise70 Cochrane study-level",
            "sources": [
              "ClinicalTrials.gov",
              "AACT",
              "PubMed",
              "OpenAlex"
            ],
            "pdf_pipeline_used": false
          },
          "counts": {
            "cardio_review_ids": 52,
            "cardio_dataset_files": 47,
            "prepared_datasets": 45,
            "skipped_datasets": 2,
            "pass": 45,
            "fail": 0,
            "error": 0,
            "pass_rate": 100.0
          },
          "elapsed_seconds": 9.37
        }
      }
    },
    {
      "category": "Oncology",
      "extraction": {
        "ctgov": {
          "has2x2": false,
          "hasReportedEffect": false,
          "hasResults": true,
          "matchScore": 57,
          "matchedOutcome": "Overall Survival (OS) in the TC3 or IC3-WT Populations",
          "recordExtract": "Overall Survival (OS) in the TC3 or IC3-WT Populations | Tx --/-- vs Ctrl --/--",
          "sampleNctId": "NCT02409342",
          "success": false
        },
        "pubmed": {
          "effectCount": 1,
          "firstExtract": "hazard ratio = 0.36, 95% CI: 0.14-0.92",
          "pmid": "41690366",
          "success": true,
          "title": "Four-Year Outcomes of First-Line Nivolumab Plus Ipilimumab for 6 Months Versus Continuation in Patients With Advanced NSCLC: Results of the Randomized IFCT-1701 \"DICIPLE\" Phase III Trial."
        }
      },
      "failReasons": [
        "ctgov_anchor_recall",
        "ctgov_extract"
      ],
      "name": "Checkpoint immunotherapy in NSCLC - Overall survival",
      "policy": {
        "allowedSources": [
          "ctgov",
          "pubmed",
          "openalex"
        ],
        "extractionMode": "pubmed-abstract-and-ctgov-records-only",
        "pass": true,
        "pdfUploadHidden": true,
        "pdfViewerHidden": true,
        "yearFloor": 2015
      },
      "screening": {
        "humanCheckable": true,
        "recordsWithAnchors": 0
      },
      "search": {
        "ctgov": {
          "anchorRecall": 0,
          "count": 20,
          "eligible": 5,
          "firstResult": {
            "nctId": "NCT02949843",
            "title": "Phase II Pilot Study Evaluating Strategies to Overcome Resistance at the Time of Progression for Patients With Non-small Cell Lung Cancers Harboring Major Oncogenic Drivers",
            "year": "2017"
          },
          "matched": [],
          "statusText": "CT.gov: kept 20 trials after applying the 2015+ floor"
        },
        "openalex": {
          "anchorRecall": 0,
          "count": 20,
          "eligible": 5,
          "firstResult": {
            "doi": "10.1038/s41591-018-0134-3",
            "pmid": "30082870",
            "title": "Blood-based tumor mutational burden as a predictor of clinical benefit in non-small-cell lung cancer patients treated with atezolizumab",
            "year": "2018"
          },
          "matched": [],
          "statusText": "OpenAlex: kept 20 records after applying the 2015+ floor"
        },
        "pubmed": {
          "anchorRecall": 0,
          "count": 20,
          "eligible": 5,
          "firstResult": {
            "doi": "10.1016/j.intimp.2026.116481",
            "pmid": "41806690",
            "title": "Efficacy and safety of a low-dose nivolumab regimen (240\u00a0mg) as neoadjuvant immunochemotherapy in Chinese patients with resectable non-small cell lung cancer: a prospective single-arm, exploratory study.",
            "year": "2026"
          },
          "matched": [],
          "statusText": "3595 total results (PubMed: 20)"
        }
      },
      "status": "warn",
      "topicId": "nsclc_immunotherapy_os",
      "validationPackId": null,
      "id": "nsclc_immunotherapy_os"
    },
    {
      "category": "Oncology",
      "extraction": {
        "ctgov": {
          "has2x2": false,
          "hasReportedEffect": false,
          "hasResults": true,
          "matchScore": 57,
          "matchedOutcome": "Progression-free Survival (PFS) in the TC3 or IC3-WT Populations",
          "recordExtract": "Progression-free Survival (PFS) in the TC3 or IC3-WT Populations | Tx --/-- vs Ctrl --/--",
          "sampleNctId": "NCT02409342",
          "success": false
        },
        "pubmed": {
          "effectCount": 1,
          "firstExtract": "hazard ratio = 0.36, 95% CI: 0.14-0.92",
          "pmid": "41690366",
          "success": true,
          "title": "Four-Year Outcomes of First-Line Nivolumab Plus Ipilimumab for 6 Months Versus Continuation in Patients With Advanced NSCLC: Results of the Randomized IFCT-1701 \"DICIPLE\" Phase III Trial."
        }
      },
      "failReasons": [
        "ctgov_anchor_recall",
        "ctgov_extract"
      ],
      "name": "Checkpoint immunotherapy in NSCLC - Progression-free survival",
      "policy": {
        "allowedSources": [
          "ctgov",
          "pubmed",
          "openalex"
        ],
        "extractionMode": "pubmed-abstract-and-ctgov-records-only",
        "pass": true,
        "pdfUploadHidden": true,
        "pdfViewerHidden": true,
        "yearFloor": 2015
      },
      "screening": {
        "humanCheckable": true,
        "recordsWithAnchors": 0
      },
      "search": {
        "ctgov": {
          "anchorRecall": 0,
          "count": 20,
          "eligible": 5,
          "firstResult": {
            "nctId": "NCT02949843",
            "title": "Phase II Pilot Study Evaluating Strategies to Overcome Resistance at the Time of Progression for Patients With Non-small Cell Lung Cancers Harboring Major Oncogenic Drivers",
            "year": "2017"
          },
          "matched": [],
          "statusText": "CT.gov: kept 20 trials after applying the 2015+ floor"
        },
        "openalex": {
          "anchorRecall": 0,
          "count": 20,
          "eligible": 5,
          "firstResult": {
            "doi": "10.1038/s41591-018-0134-3",
            "pmid": "30082870",
            "title": "Blood-based tumor mutational burden as a predictor of clinical benefit in non-small-cell lung cancer patients treated with atezolizumab",
            "year": "2018"
          },
          "matched": [],
          "statusText": "OpenAlex: kept 20 records after applying the 2015+ floor"
        },
        "pubmed": {
          "anchorRecall": 0,
          "count": 20,
          "eligible": 5,
          "firstResult": {
            "doi": "10.1016/j.intimp.2026.116481",
            "pmid": "41806690",
            "title": "Efficacy and safety of a low-dose nivolumab regimen (240\u00a0mg) as neoadjuvant immunochemotherapy in Chinese patients with resectable non-small cell lung cancer: a prospective single-arm, exploratory study.",
            "year": "2026"
          },
          "matched": [],
          "statusText": "3655 total results (PubMed: 20)"
        }
      },
      "status": "warn",
      "topicId": "nsclc_immunotherapy_pfs",
      "validationPackId": null,
      "id": "nsclc_immunotherapy_pfs"
    },
    {
      "category": "Oncology",
      "extraction": {
        "ctgov": {
          "has2x2": false,
          "hasReportedEffect": false,
          "hasResults": true,
          "matchScore": 69,
          "matchedOutcome": "Overall Survival (OS) in the TC3 or IC3-WT Populations",
          "recordExtract": "Overall Survival (OS) in the TC3 or IC3-WT Populations | Tx --/-- vs Ctrl --/--",
          "sampleNctId": "NCT02409342",
          "success": false
        },
        "pubmed": {
          "effectCount": 1,
          "firstExtract": "hazard ratio = 0.36, 95% CI: 0.14-0.92",
          "pmid": "41690366",
          "success": true,
          "title": "Four-Year Outcomes of First-Line Nivolumab Plus Ipilimumab for 6 Months Versus Continuation in Patients With Advanced NSCLC: Results of the Randomized IFCT-1701 \"DICIPLE\" Phase III Trial."
        }
      },
      "failReasons": [
        "ctgov_anchor_recall",
        "ctgov_extract"
      ],
      "name": "Checkpoint immunotherapy in NSCLC - High PD-L1 subgroup",
      "policy": {
        "allowedSources": [
          "ctgov",
          "pubmed",
          "openalex"
        ],
        "extractionMode": "pubmed-abstract-and-ctgov-records-only",
        "pass": true,
        "pdfUploadHidden": true,
        "pdfViewerHidden": true,
        "yearFloor": 2015
      },
      "screening": {
        "humanCheckable": true,
        "recordsWithAnchors": 0
      },
      "search": {
        "ctgov": {
          "anchorRecall": 0,
          "count": 20,
          "eligible": 5,
          "firstResult": {
            "nctId": "NCT02949843",
            "title": "Phase II Pilot Study Evaluating Strategies to Overcome Resistance at the Time of Progression for Patients With Non-small Cell Lung Cancers Harboring Major Oncogenic Drivers",
            "year": "2017"
          },
          "matched": [],
          "statusText": "CT.gov: kept 20 trials after applying the 2015+ floor"
        },
        "openalex": {
          "anchorRecall": 0,
          "count": 20,
          "eligible": 5,
          "firstResult": {
            "doi": "10.1038/s41591-018-0134-3",
            "pmid": "30082870",
            "title": "Blood-based tumor mutational burden as a predictor of clinical benefit in non-small-cell lung cancer patients treated with atezolizumab",
            "year": "2018"
          },
          "matched": [],
          "statusText": "OpenAlex: kept 20 records after applying the 2015+ floor"
        },
        "pubmed": {
          "anchorRecall": 0,
          "count": 20,
          "eligible": 5,
          "firstResult": {
            "doi": "10.1016/j.intimp.2026.116481",
            "pmid": "41806690",
            "title": "Efficacy and safety of a low-dose nivolumab regimen (240\u00a0mg) as neoadjuvant immunochemotherapy in Chinese patients with resectable non-small cell lung cancer: a prospective single-arm, exploratory study.",
            "year": "2026"
          },
          "matched": [],
          "statusText": "3715 total results (PubMed: 20)"
        }
      },
      "status": "warn",
      "topicId": "nsclc_immunotherapy_pdl1",
      "validationPackId": null,
      "id": "nsclc_immunotherapy_pdl1"
    },
    {
      "category": "Pulmonary Hypertension",
      "extraction": {
        "ctgov": {
          "has2x2": false,
          "hasReportedEffect": false,
          "hasResults": true,
          "matchScore": 33,
          "matchedOutcome": "Time to First Confirmed Morbidity or Mortality Event",
          "recordExtract": "Time to First Confirmed Morbidity or Mortality Event | Tx --/-- vs Ctrl --/--",
          "sampleNctId": "NCT04896008",
          "success": false
        },
        "pubmed": {
          "effectCount": 1,
          "firstExtract": "HR = 0.45; 95% CI 0.29-0.70",
          "pmid": "41727799",
          "success": true,
          "title": "Sotatercept Versus Selexipag in Severe Pulmonary Arterial Hypertension: An Indirect Comparison of Efficacy Based on an Artificial-Intelligence Method That Reconstructed Patient-Level Data From Three Randomized Trials."
        }
      },
      "failReasons": [
        "ctgov_extract"
      ],
      "name": "Novel therapies in pulmonary arterial hypertension - Clinical worsening",
      "policy": {
        "allowedSources": [
          "ctgov",
          "pubmed",
          "openalex"
        ],
        "extractionMode": "pubmed-abstract-and-ctgov-records-only",
        "pass": true,
        "pdfUploadHidden": true,
        "pdfViewerHidden": true,
        "yearFloor": 2015
      },
      "screening": {
        "humanCheckable": true,
        "recordsWithAnchors": 2
      },
      "search": {
        "ctgov": {
          "anchorRecall": 0.6666666666666666,
          "count": 18,
          "eligible": 3,
          "firstResult": {
            "nctId": "NCT07356778",
            "title": "An Open-label, Randomized, Controlled Trial to Evaluate the Efficacy of Sotatercept Add-on Therapy Compared to Standard PAH Therapy With Pulmonary Vasodilators for Pulmonary Arterial Hypertension Associated With Pulmonary Vasodilator-resistant, Unrepaired Congenital Shunts (ASD, VSD, PDA) Including Eisenmenger Syndrome\uff1aSuMILE Trial",
            "year": "2025"
          },
          "matched": [
            "NCT04576988",
            "NCT04896008"
          ],
          "statusText": "CT.gov: kept 18 trials after applying the 2015+ floor"
        },
        "openalex": {
          "anchorRecall": 0,
          "count": 20,
          "eligible": 3,
          "firstResult": {
            "doi": "10.1183/13993003.00879-2022",
            "pmid": "36028254",
            "title": "2022 ESC/ERS Guidelines for the diagnosis and treatment of pulmonary hypertension",
            "year": "2022"
          },
          "matched": [],
          "statusText": "OpenAlex: kept 20 records after applying the 2015+ floor"
        },
        "pubmed": {
          "anchorRecall": 1,
          "count": 20,
          "eligible": 3,
          "firstResult": {
            "doi": "10.7759/cureus.c411",
            "pmid": "41798658",
            "title": "Correction: Sotatercept Versus Selexipag in Severe Pulmonary Arterial Hypertension: An Indirect Comparison of Efficacy Based on an Artificial-Intelligence Method That Reconstructed Patient-Level Data From Three Randomized Trials.",
            "year": "2026"
          },
          "matched": [
            "NCT01106014",
            "NCT04576988",
            "NCT04896008"
          ],
          "statusText": "3773 total results (PubMed: 20)"
        }
      },
      "status": "warn",
      "topicId": "pah_novel_worsening",
      "validationPackId": null,
      "id": "pah_novel_worsening"
    },
    {
      "category": "Pulmonary Hypertension",
      "extraction": {
        "ctgov": {
          "has2x2": false,
          "hasReportedEffect": false,
          "hasResults": true,
          "matchScore": 15,
          "matchedOutcome": "Time to First Confirmed Morbidity or Mortality Event",
          "recordExtract": "Time to First Confirmed Morbidity or Mortality Event | Tx --/-- vs Ctrl --/--",
          "sampleNctId": "NCT04896008",
          "success": false
        },
        "pubmed": {
          "effectCount": 1,
          "firstExtract": "HR = 0.45; 95% CI 0.29-0.70",
          "pmid": "41727799",
          "success": true,
          "title": "Sotatercept Versus Selexipag in Severe Pulmonary Arterial Hypertension: An Indirect Comparison of Efficacy Based on an Artificial-Intelligence Method That Reconstructed Patient-Level Data From Three Randomized Trials."
        }
      },
      "failReasons": [
        "ctgov_extract"
      ],
      "name": "Novel therapies in pulmonary arterial hypertension - Exercise capacity",
      "policy": {
        "allowedSources": [
          "ctgov",
          "pubmed",
          "openalex"
        ],
        "extractionMode": "pubmed-abstract-and-ctgov-records-only",
        "pass": true,
        "pdfUploadHidden": true,
        "pdfViewerHidden": true,
        "yearFloor": 2015
      },
      "screening": {
        "humanCheckable": true,
        "recordsWithAnchors": 2
      },
      "search": {
        "ctgov": {
          "anchorRecall": 0.6666666666666666,
          "count": 18,
          "eligible": 3,
          "firstResult": {
            "nctId": "NCT07356778",
            "title": "An Open-label, Randomized, Controlled Trial to Evaluate the Efficacy of Sotatercept Add-on Therapy Compared to Standard PAH Therapy With Pulmonary Vasodilators for Pulmonary Arterial Hypertension Associated With Pulmonary Vasodilator-resistant, Unrepaired Congenital Shunts (ASD, VSD, PDA) Including Eisenmenger Syndrome\uff1aSuMILE Trial",
            "year": "2025"
          },
          "matched": [
            "NCT04576988",
            "NCT04896008"
          ],
          "statusText": "CT.gov: kept 18 trials after applying the 2015+ floor"
        },
        "openalex": {
          "anchorRecall": 0,
          "count": 20,
          "eligible": 3,
          "firstResult": {
            "doi": "10.1183/13993003.00879-2022",
            "pmid": "36028254",
            "title": "2022 ESC/ERS Guidelines for the diagnosis and treatment of pulmonary hypertension",
            "year": "2022"
          },
          "matched": [],
          "statusText": "OpenAlex: kept 20 records after applying the 2015+ floor"
        },
        "pubmed": {
          "anchorRecall": 1,
          "count": 20,
          "eligible": 3,
          "firstResult": {
            "doi": "10.7759/cureus.c411",
            "pmid": "41798658",
            "title": "Correction: Sotatercept Versus Selexipag in Severe Pulmonary Arterial Hypertension: An Indirect Comparison of Efficacy Based on an Artificial-Intelligence Method That Reconstructed Patient-Level Data From Three Randomized Trials.",
            "year": "2026"
          },
          "matched": [
            "NCT01106014",
            "NCT04576988",
            "NCT04896008"
          ],
          "statusText": "3831 total results (PubMed: 20)"
        }
      },
      "status": "warn",
      "topicId": "pah_novel_exercise",
      "validationPackId": null,
      "id": "pah_novel_exercise"
    },
    {
      "category": "Structural Heart Disease",
      "extraction": {
        "ctgov": {
          "has2x2": false,
          "hasReportedEffect": false,
          "hasResults": true,
          "matchScore": 15,
          "matchedOutcome": "Incidence of Adverse Events (AEs)",
          "recordExtract": "Incidence of Adverse Events (AEs) | Tx --/-- vs Ctrl --/--",
          "sampleNctId": "NCT04219826",
          "success": false
        },
        "pubmed": {
          "effectCount": 3,
          "firstExtract": "MD: -18.15, 95% CI: -32.65 to -3.65",
          "pmid": "41659081",
          "success": true,
          "title": "Effect of Cardiac Myosin Inhibitors on Echocardiographic Features of Cardiac Structure and Function in Hypertrophic Cardiomyopathy: A Systematic Review and Meta-Analysis."
        }
      },
      "failReasons": [
        "ctgov_extract"
      ],
      "name": "Cardiac myosin inhibition in hypertrophic cardiomyopathy - Symptoms and functional class",
      "policy": {
        "allowedSources": [
          "ctgov",
          "pubmed",
          "openalex"
        ],
        "extractionMode": "pubmed-abstract-and-ctgov-records-only",
        "pass": true,
        "pdfUploadHidden": true,
        "pdfViewerHidden": true,
        "yearFloor": 2015
      },
      "screening": {
        "humanCheckable": true,
        "recordsWithAnchors": 1
      },
      "search": {
        "ctgov": {
          "anchorRecall": 0.3333333333333333,
          "count": 20,
          "eligible": 3,
          "firstResult": {
            "nctId": "NCT07107373",
            "title": "MavAcamten Real World eVidEnce coLlaboration in HCM (MARVEL-HCM)",
            "year": "2023"
          },
          "matched": [
            "NCT03470545"
          ],
          "statusText": "CT.gov: kept 20 trials after applying the 2015+ floor"
        },
        "openalex": {
          "anchorRecall": 0.3333333333333333,
          "count": 20,
          "eligible": 3,
          "firstResult": {
            "doi": "10.1016/j.cardfail.2023.07.003",
            "pmid": "37473912",
            "title": "Aficamten for Drug-Refractory Severe Obstructive Hypertrophic Cardiomyopathy in Patients Receiving Disopyramide: REDWOOD-HCM Cohort 3",
            "year": "2023"
          },
          "matched": [
            "NCT04219826"
          ],
          "statusText": "OpenAlex: kept 20 records after applying the 2015+ floor"
        },
        "pubmed": {
          "anchorRecall": 0.6666666666666666,
          "count": 20,
          "eligible": 3,
          "firstResult": {
            "doi": "10.1111/cts.70514",
            "pmid": "41784061",
            "title": "Clinical Evaluation of Drug-Drug Interactions With Aficamten.",
            "year": "2026"
          },
          "matched": [
            "NCT03470545",
            "NCT04349072"
          ],
          "statusText": "3891 total results (PubMed: 20)"
        }
      },
      "status": "warn",
      "topicId": "hcm_myosin_symptoms",
      "validationPackId": null,
      "id": "hcm_myosin_symptoms"
    },
    {
      "category": "Structural Heart Disease",
      "extraction": {
        "ctgov": {
          "has2x2": false,
          "hasReportedEffect": false,
          "hasResults": true,
          "matchScore": 63,
          "matchedOutcome": "Slope of the Relationship of the Plasma Concentration of CK-3773274 to the Change From Baseline in the Resting Left Ventricular Outflow Track Gradient (LVOT-G)",
          "recordExtract": "Slope of the Relationship of the Plasma Concentration of CK-3773274 to the Change From Baseline in the Resting Left Ventricular Outflow Track Gradient (LVOT-G) | Tx --/-- vs Ctrl --/--",
          "sampleNctId": "NCT04219826",
          "success": false
        },
        "pubmed": {
          "effectCount": 3,
          "firstExtract": "MD: -18.15, 95% CI: -32.65 to -3.65",
          "pmid": "41659081",
          "success": true,
          "title": "Effect of Cardiac Myosin Inhibitors on Echocardiographic Features of Cardiac Structure and Function in Hypertrophic Cardiomyopathy: A Systematic Review and Meta-Analysis."
        }
      },
      "failReasons": [
        "ctgov_extract"
      ],
      "name": "Cardiac myosin inhibition in hypertrophic cardiomyopathy - LVOT gradient",
      "policy": {
        "allowedSources": [
          "ctgov",
          "pubmed",
          "openalex"
        ],
        "extractionMode": "pubmed-abstract-and-ctgov-records-only",
        "pass": true,
        "pdfUploadHidden": true,
        "pdfViewerHidden": true,
        "yearFloor": 2015
      },
      "screening": {
        "humanCheckable": true,
        "recordsWithAnchors": 1
      },
      "search": {
        "ctgov": {
          "anchorRecall": 0.3333333333333333,
          "count": 20,
          "eligible": 3,
          "firstResult": {
            "nctId": "NCT07107373",
            "title": "MavAcamten Real World eVidEnce coLlaboration in HCM (MARVEL-HCM)",
            "year": "2023"
          },
          "matched": [
            "NCT03470545"
          ],
          "statusText": "CT.gov: kept 20 trials after applying the 2015+ floor"
        },
        "openalex": {
          "anchorRecall": 0.3333333333333333,
          "count": 20,
          "eligible": 3,
          "firstResult": {
            "doi": "10.1016/j.cardfail.2023.07.003",
            "pmid": "37473912",
            "title": "Aficamten for Drug-Refractory Severe Obstructive Hypertrophic Cardiomyopathy in Patients Receiving Disopyramide: REDWOOD-HCM Cohort 3",
            "year": "2023"
          },
          "matched": [
            "NCT04219826"
          ],
          "statusText": "OpenAlex: kept 20 records after applying the 2015+ floor"
        },
        "pubmed": {
          "anchorRecall": 0.6666666666666666,
          "count": 20,
          "eligible": 3,
          "firstResult": {
            "doi": "10.1111/cts.70514",
            "pmid": "41784061",
            "title": "Clinical Evaluation of Drug-Drug Interactions With Aficamten.",
            "year": "2026"
          },
          "matched": [
            "NCT03470545",
            "NCT04349072"
          ],
          "statusText": "3951 total results (PubMed: 20)"
        }
      },
      "status": "warn",
      "topicId": "hcm_myosin_lvot",
      "validationPackId": null,
      "id": "hcm_myosin_lvot"
    }
  ],
  "topicsById": {
    "sglt2i_hf_composite": {
      "category": "Heart Failure",
      "extraction": {
        "ctgov": {
          "has2x2": false,
          "hasReportedEffect": true,
          "hasResults": true,
          "matchScore": 98,
          "matchedOutcome": "Number of Total Occurrences of Cardiovascular (CV) Death, Hospitalizations for Heart Failure (HHF) and Urgent Visits for Heart Failure (HF)",
          "recordExtract": "Number of Total Occurrences of Cardiovascular (CV) Death, Hospitalizations for Heart Failure (HHF) and Urgent Visits for Heart Failure (HF) | Tx --/-- vs Ctrl --/--",
          "sampleNctId": "NCT03521934",
          "success": true
        },
        "pubmed": {
          "effectCount": 3,
          "firstExtract": "RR: 0.80, 95% CI 0.69-0.93",
          "pmid": "41789221",
          "success": true,
          "title": "A network meta-analysis of safety and efficacy of sodium-glucose cotransporter 2 inhibitors in heart failure patients."
        }
      },
      "failReasons": [],
      "name": "SGLT2 inhibitors - Heart Failure - Composite",
      "policy": {
        "allowedSources": [
          "ctgov",
          "pubmed",
          "openalex"
        ],
        "extractionMode": "pubmed-abstract-and-ctgov-records-only",
        "pass": true,
        "pdfUploadHidden": true,
        "pdfViewerHidden": true,
        "yearFloor": 2015
      },
      "screening": {
        "humanCheckable": true,
        "recordsWithAnchors": 1
      },
      "search": {
        "ctgov": {
          "anchorRecall": 0.2,
          "count": 20,
          "eligible": 5,
          "firstResult": {
            "nctId": "NCT06578078",
            "title": "A Randomized Clinical Trial to Define the Best Strategy for the Management of Heart Failure and Chronic Kidney Disease Among Elderly Patients With or at High Risk of hyperKalemia in Span by Optimizing the Use of RAASi With SZC",
            "year": "2024"
          },
          "matched": [
            "NCT03036124"
          ],
          "statusText": "CT.gov: kept 20 trials after applying the 2015+ floor"
        },
        "openalex": {
          "anchorRecall": 0.4,
          "count": 20,
          "eligible": 5,
          "firstResult": {
            "doi": "10.1038/s41591-021-01659-1",
            "pmid": "35228754",
            "title": "The SGLT2 inhibitor empagliflozin in patients hospitalized for acute heart failure: a multinational randomized trial",
            "year": "2022"
          },
          "matched": [
            "NCT03036124",
            "NCT03057977"
          ],
          "statusText": "OpenAlex: kept 20 records after applying the 2015+ floor"
        },
        "pubmed": {
          "anchorRecall": 0.8,
          "count": 20,
          "eligible": 5,
          "firstResult": {
            "doi": "10.1016/j.jtcvs.2026.02.037",
            "pmid": "41831709",
            "title": "Sodium-glucose cotransporter 2 inhibitor use and outcomes after surgical aortic valve replacement.",
            "year": "2026"
          },
          "matched": [
            "NCT03036124",
            "NCT03057977",
            "NCT03057951",
            "NCT03619213"
          ],
          "statusText": "40 total results (PubMed: 20)"
        }
      },
      "status": "pass",
      "topicId": "sglt2i_hf_composite",
      "validationPackId": "sglt2i_hf_benchmark",
      "id": "sglt2i_hf_composite",
      "pack": {
        "id": "sglt2i_hf_benchmark",
        "meta": {
          "date": "2026-03-13",
          "id": "sglt2i_hf_benchmark",
          "name": "SGLT2 HF/CKD Golden Benchmark",
          "reference": {
            "journal": "Lancet",
            "title": "Vaduganathan et al. SGLT2 inhibitors in heart failure and kidney disease",
            "year": 2022
          },
          "summary": "Bundled golden HF and CKD benchmark outcomes aligned to Vaduganathan 2022 Lancet and CRES v5.0.",
          "tier": "exact",
          "verdict": "PASS"
        },
        "report_summary": null
      }
    },
    "sglt2i_hf_hfh": {
      "category": "Heart Failure",
      "extraction": {
        "ctgov": {
          "has2x2": false,
          "hasReportedEffect": true,
          "hasResults": true,
          "matchScore": 98,
          "matchedOutcome": "Number of Total Occurrences of Cardiovascular (CV) Death, Hospitalizations for Heart Failure (HHF) and Urgent Visits for Heart Failure (HF)",
          "recordExtract": "Number of Total Occurrences of Cardiovascular (CV) Death, Hospitalizations for Heart Failure (HHF) and Urgent Visits for Heart Failure (HF) | Tx --/-- vs Ctrl --/--",
          "sampleNctId": "NCT03521934",
          "success": true
        },
        "pubmed": {
          "effectCount": 3,
          "firstExtract": "RR: 0.80, 95% CI 0.69-0.93",
          "pmid": "41789221",
          "success": true,
          "title": "A network meta-analysis of safety and efficacy of sodium-glucose cotransporter 2 inhibitors in heart failure patients."
        }
      },
      "failReasons": [],
      "name": "SGLT2 inhibitors - Heart Failure - HF hospitalization",
      "policy": {
        "allowedSources": [
          "ctgov",
          "pubmed",
          "openalex"
        ],
        "extractionMode": "pubmed-abstract-and-ctgov-records-only",
        "pass": true,
        "pdfUploadHidden": true,
        "pdfViewerHidden": true,
        "yearFloor": 2015
      },
      "screening": {
        "humanCheckable": true,
        "recordsWithAnchors": 1
      },
      "search": {
        "ctgov": {
          "anchorRecall": 0.2,
          "count": 20,
          "eligible": 5,
          "firstResult": {
            "nctId": "NCT06578078",
            "title": "A Randomized Clinical Trial to Define the Best Strategy for the Management of Heart Failure and Chronic Kidney Disease Among Elderly Patients With or at High Risk of hyperKalemia in Span by Optimizing the Use of RAASi With SZC",
            "year": "2024"
          },
          "matched": [
            "NCT03036124"
          ],
          "statusText": "CT.gov: kept 20 trials after applying the 2015+ floor"
        },
        "openalex": {
          "anchorRecall": 0.4,
          "count": 20,
          "eligible": 5,
          "firstResult": {
            "doi": "10.1038/s41591-021-01659-1",
            "pmid": "35228754",
            "title": "The SGLT2 inhibitor empagliflozin in patients hospitalized for acute heart failure: a multinational randomized trial",
            "year": "2022"
          },
          "matched": [
            "NCT03036124",
            "NCT03057977"
          ],
          "statusText": "OpenAlex: kept 20 records after applying the 2015+ floor"
        },
        "pubmed": {
          "anchorRecall": 0.8,
          "count": 20,
          "eligible": 5,
          "firstResult": {
            "doi": "10.1016/j.jtcvs.2026.02.037",
            "pmid": "41831709",
            "title": "Sodium-glucose cotransporter 2 inhibitor use and outcomes after surgical aortic valve replacement.",
            "year": "2026"
          },
          "matched": [
            "NCT03036124",
            "NCT03057977",
            "NCT03057951",
            "NCT03619213"
          ],
          "statusText": "100 total results (PubMed: 20)"
        }
      },
      "status": "pass",
      "topicId": "sglt2i_hf_hfh",
      "validationPackId": "sglt2i_hf_benchmark",
      "id": "sglt2i_hf_hfh",
      "pack": {
        "id": "sglt2i_hf_benchmark",
        "meta": {
          "date": "2026-03-13",
          "id": "sglt2i_hf_benchmark",
          "name": "SGLT2 HF/CKD Golden Benchmark",
          "reference": {
            "journal": "Lancet",
            "title": "Vaduganathan et al. SGLT2 inhibitors in heart failure and kidney disease",
            "year": 2022
          },
          "summary": "Bundled golden HF and CKD benchmark outcomes aligned to Vaduganathan 2022 Lancet and CRES v5.0.",
          "tier": "exact",
          "verdict": "PASS"
        },
        "report_summary": null
      }
    },
    "sglt2i_hf_cvdeath": {
      "category": "Heart Failure",
      "extraction": {
        "ctgov": {
          "has2x2": false,
          "hasReportedEffect": true,
          "hasResults": true,
          "matchScore": 75,
          "matchedOutcome": "Number of Total Occurrences of Cardiovascular (CV) Death, Hospitalizations for Heart Failure (HHF) and Urgent Visits for Heart Failure (HF)",
          "recordExtract": "Number of Total Occurrences of Cardiovascular (CV) Death, Hospitalizations for Heart Failure (HHF) and Urgent Visits for Heart Failure (HF) | Tx --/-- vs Ctrl --/--",
          "sampleNctId": "NCT03521934",
          "success": true
        },
        "pubmed": {
          "effectCount": 3,
          "firstExtract": "RR: 0.80, 95% CI 0.69-0.93",
          "pmid": "41789221",
          "success": true,
          "title": "A network meta-analysis of safety and efficacy of sodium-glucose cotransporter 2 inhibitors in heart failure patients."
        }
      },
      "failReasons": [],
      "name": "SGLT2 inhibitors - Heart Failure - CV death",
      "policy": {
        "allowedSources": [
          "ctgov",
          "pubmed",
          "openalex"
        ],
        "extractionMode": "pubmed-abstract-and-ctgov-records-only",
        "pass": true,
        "pdfUploadHidden": true,
        "pdfViewerHidden": true,
        "yearFloor": 2015
      },
      "screening": {
        "humanCheckable": true,
        "recordsWithAnchors": 1
      },
      "search": {
        "ctgov": {
          "anchorRecall": 0.2,
          "count": 20,
          "eligible": 5,
          "firstResult": {
            "nctId": "NCT06578078",
            "title": "A Randomized Clinical Trial to Define the Best Strategy for the Management of Heart Failure and Chronic Kidney Disease Among Elderly Patients With or at High Risk of hyperKalemia in Span by Optimizing the Use of RAASi With SZC",
            "year": "2024"
          },
          "matched": [
            "NCT03036124"
          ],
          "statusText": "CT.gov: kept 20 trials after applying the 2015+ floor"
        },
        "openalex": {
          "anchorRecall": 0.4,
          "count": 20,
          "eligible": 5,
          "firstResult": {
            "doi": "10.1038/s41591-021-01659-1",
            "pmid": "35228754",
            "title": "The SGLT2 inhibitor empagliflozin in patients hospitalized for acute heart failure: a multinational randomized trial",
            "year": "2022"
          },
          "matched": [
            "NCT03036124",
            "NCT03057977"
          ],
          "statusText": "OpenAlex: kept 20 records after applying the 2015+ floor"
        },
        "pubmed": {
          "anchorRecall": 0.8,
          "count": 20,
          "eligible": 5,
          "firstResult": {
            "doi": "10.1016/j.jtcvs.2026.02.037",
            "pmid": "41831709",
            "title": "Sodium-glucose cotransporter 2 inhibitor use and outcomes after surgical aortic valve replacement.",
            "year": "2026"
          },
          "matched": [
            "NCT03036124",
            "NCT03057977",
            "NCT03057951",
            "NCT03619213"
          ],
          "statusText": "160 total results (PubMed: 20)"
        }
      },
      "status": "pass",
      "topicId": "sglt2i_hf_cvdeath",
      "validationPackId": "sglt2i_hf_benchmark",
      "id": "sglt2i_hf_cvdeath",
      "pack": {
        "id": "sglt2i_hf_benchmark",
        "meta": {
          "date": "2026-03-13",
          "id": "sglt2i_hf_benchmark",
          "name": "SGLT2 HF/CKD Golden Benchmark",
          "reference": {
            "journal": "Lancet",
            "title": "Vaduganathan et al. SGLT2 inhibitors in heart failure and kidney disease",
            "year": 2022
          },
          "summary": "Bundled golden HF and CKD benchmark outcomes aligned to Vaduganathan 2022 Lancet and CRES v5.0.",
          "tier": "exact",
          "verdict": "PASS"
        },
        "report_summary": null
      }
    },
    "sglt2i_hf_allcause": {
      "category": "Heart Failure",
      "extraction": {
        "ctgov": {
          "has2x2": false,
          "hasReportedEffect": true,
          "hasResults": true,
          "matchScore": 33,
          "matchedOutcome": "Number of Total Occurrences of Cardiovascular (CV) Death, Hospitalizations for Heart Failure (HHF) and Urgent Visits for Heart Failure (HF)",
          "recordExtract": "Number of Total Occurrences of Cardiovascular (CV) Death, Hospitalizations for Heart Failure (HHF) and Urgent Visits for Heart Failure (HF) | Tx --/-- vs Ctrl --/--",
          "sampleNctId": "NCT03521934",
          "success": true
        },
        "pubmed": {
          "effectCount": 3,
          "firstExtract": "RR: 0.80, 95% CI 0.69-0.93",
          "pmid": "41789221",
          "success": true,
          "title": "A network meta-analysis of safety and efficacy of sodium-glucose cotransporter 2 inhibitors in heart failure patients."
        }
      },
      "failReasons": [],
      "name": "SGLT2 inhibitors - Heart Failure - All-cause mortality",
      "policy": {
        "allowedSources": [
          "ctgov",
          "pubmed",
          "openalex"
        ],
        "extractionMode": "pubmed-abstract-and-ctgov-records-only",
        "pass": true,
        "pdfUploadHidden": true,
        "pdfViewerHidden": true,
        "yearFloor": 2015
      },
      "screening": {
        "humanCheckable": true,
        "recordsWithAnchors": 1
      },
      "search": {
        "ctgov": {
          "anchorRecall": 0.2,
          "count": 20,
          "eligible": 5,
          "firstResult": {
            "nctId": "NCT06578078",
            "title": "A Randomized Clinical Trial to Define the Best Strategy for the Management of Heart Failure and Chronic Kidney Disease Among Elderly Patients With or at High Risk of hyperKalemia in Span by Optimizing the Use of RAASi With SZC",
            "year": "2024"
          },
          "matched": [
            "NCT03036124"
          ],
          "statusText": "CT.gov: kept 20 trials after applying the 2015+ floor"
        },
        "openalex": {
          "anchorRecall": 0.4,
          "count": 20,
          "eligible": 5,
          "firstResult": {
            "doi": "10.1038/s41591-021-01659-1",
            "pmid": "35228754",
            "title": "The SGLT2 inhibitor empagliflozin in patients hospitalized for acute heart failure: a multinational randomized trial",
            "year": "2022"
          },
          "matched": [
            "NCT03036124",
            "NCT03057977"
          ],
          "statusText": "OpenAlex: kept 20 records after applying the 2015+ floor"
        },
        "pubmed": {
          "anchorRecall": 0.8,
          "count": 20,
          "eligible": 5,
          "firstResult": {
            "doi": "10.1016/j.jtcvs.2026.02.037",
            "pmid": "41831709",
            "title": "Sodium-glucose cotransporter 2 inhibitor use and outcomes after surgical aortic valve replacement.",
            "year": "2026"
          },
          "matched": [
            "NCT03036124",
            "NCT03057977",
            "NCT03057951",
            "NCT03619213"
          ],
          "statusText": "220 total results (PubMed: 20)"
        }
      },
      "status": "pass",
      "topicId": "sglt2i_hf_allcause",
      "validationPackId": "sglt2i_hf_benchmark",
      "id": "sglt2i_hf_allcause",
      "pack": {
        "id": "sglt2i_hf_benchmark",
        "meta": {
          "date": "2026-03-13",
          "id": "sglt2i_hf_benchmark",
          "name": "SGLT2 HF/CKD Golden Benchmark",
          "reference": {
            "journal": "Lancet",
            "title": "Vaduganathan et al. SGLT2 inhibitors in heart failure and kidney disease",
            "year": 2022
          },
          "summary": "Bundled golden HF and CKD benchmark outcomes aligned to Vaduganathan 2022 Lancet and CRES v5.0.",
          "tier": "exact",
          "verdict": "PASS"
        },
        "report_summary": null
      }
    },
    "sglt2i_hf_hfref": {
      "category": "Heart Failure",
      "extraction": {
        "ctgov": {
          "has2x2": false,
          "hasReportedEffect": true,
          "hasResults": true,
          "matchScore": 15,
          "matchedOutcome": "Number of Total Occurrences of Cardiovascular (CV) Death, Hospitalizations for Heart Failure (HHF) and Urgent Visits for Heart Failure (HF)",
          "recordExtract": "Number of Total Occurrences of Cardiovascular (CV) Death, Hospitalizations for Heart Failure (HHF) and Urgent Visits for Heart Failure (HF) | Tx --/-- vs Ctrl --/--",
          "sampleNctId": "NCT03521934",
          "success": true
        },
        "pubmed": {
          "effectCount": 3,
          "firstExtract": "RR: 0.80, 95% CI 0.69-0.93",
          "pmid": "41789221",
          "success": true,
          "title": "A network meta-analysis of safety and efficacy of sodium-glucose cotransporter 2 inhibitors in heart failure patients."
        }
      },
      "failReasons": [],
      "name": "SGLT2 inhibitors - Heart Failure - HFrEF subgroup",
      "policy": {
        "allowedSources": [
          "ctgov",
          "pubmed",
          "openalex"
        ],
        "extractionMode": "pubmed-abstract-and-ctgov-records-only",
        "pass": true,
        "pdfUploadHidden": true,
        "pdfViewerHidden": true,
        "yearFloor": 2015
      },
      "screening": {
        "humanCheckable": true,
        "recordsWithAnchors": 1
      },
      "search": {
        "ctgov": {
          "anchorRecall": 0.2,
          "count": 20,
          "eligible": 5,
          "firstResult": {
            "nctId": "NCT06578078",
            "title": "A Randomized Clinical Trial to Define the Best Strategy for the Management of Heart Failure and Chronic Kidney Disease Among Elderly Patients With or at High Risk of hyperKalemia in Span by Optimizing the Use of RAASi With SZC",
            "year": "2024"
          },
          "matched": [
            "NCT03036124"
          ],
          "statusText": "CT.gov: kept 20 trials after applying the 2015+ floor"
        },
        "openalex": {
          "anchorRecall": 0.4,
          "count": 20,
          "eligible": 5,
          "firstResult": {
            "doi": "10.1038/s41591-021-01659-1",
            "pmid": "35228754",
            "title": "The SGLT2 inhibitor empagliflozin in patients hospitalized for acute heart failure: a multinational randomized trial",
            "year": "2022"
          },
          "matched": [
            "NCT03036124",
            "NCT03057977"
          ],
          "statusText": "OpenAlex: kept 20 records after applying the 2015+ floor"
        },
        "pubmed": {
          "anchorRecall": 0.8,
          "count": 20,
          "eligible": 5,
          "firstResult": {
            "doi": "10.1016/j.jtcvs.2026.02.037",
            "pmid": "41831709",
            "title": "Sodium-glucose cotransporter 2 inhibitor use and outcomes after surgical aortic valve replacement.",
            "year": "2026"
          },
          "matched": [
            "NCT03036124",
            "NCT03057977",
            "NCT03057951",
            "NCT03619213"
          ],
          "statusText": "280 total results (PubMed: 20)"
        }
      },
      "status": "pass",
      "topicId": "sglt2i_hf_hfref",
      "validationPackId": "sglt2i_hf_benchmark",
      "id": "sglt2i_hf_hfref",
      "pack": {
        "id": "sglt2i_hf_benchmark",
        "meta": {
          "date": "2026-03-13",
          "id": "sglt2i_hf_benchmark",
          "name": "SGLT2 HF/CKD Golden Benchmark",
          "reference": {
            "journal": "Lancet",
            "title": "Vaduganathan et al. SGLT2 inhibitors in heart failure and kidney disease",
            "year": 2022
          },
          "summary": "Bundled golden HF and CKD benchmark outcomes aligned to Vaduganathan 2022 Lancet and CRES v5.0.",
          "tier": "exact",
          "verdict": "PASS"
        },
        "report_summary": null
      }
    },
    "sglt2i_hf_hfpef": {
      "category": "Heart Failure",
      "extraction": {
        "ctgov": {
          "has2x2": false,
          "hasReportedEffect": true,
          "hasResults": true,
          "matchScore": 15,
          "matchedOutcome": "Number of Total Occurrences of Cardiovascular (CV) Death, Hospitalizations for Heart Failure (HHF) and Urgent Visits for Heart Failure (HF)",
          "recordExtract": "Number of Total Occurrences of Cardiovascular (CV) Death, Hospitalizations for Heart Failure (HHF) and Urgent Visits for Heart Failure (HF) | Tx --/-- vs Ctrl --/--",
          "sampleNctId": "NCT03521934",
          "success": true
        },
        "pubmed": {
          "effectCount": 3,
          "firstExtract": "RR: 0.80, 95% CI 0.69-0.93",
          "pmid": "41789221",
          "success": true,
          "title": "A network meta-analysis of safety and efficacy of sodium-glucose cotransporter 2 inhibitors in heart failure patients."
        }
      },
      "failReasons": [],
      "name": "SGLT2 inhibitors - Heart Failure - HFpEF subgroup",
      "policy": {
        "allowedSources": [
          "ctgov",
          "pubmed",
          "openalex"
        ],
        "extractionMode": "pubmed-abstract-and-ctgov-records-only",
        "pass": true,
        "pdfUploadHidden": true,
        "pdfViewerHidden": true,
        "yearFloor": 2015
      },
      "screening": {
        "humanCheckable": true,
        "recordsWithAnchors": 1
      },
      "search": {
        "ctgov": {
          "anchorRecall": 0.2,
          "count": 20,
          "eligible": 5,
          "firstResult": {
            "nctId": "NCT06578078",
            "title": "A Randomized Clinical Trial to Define the Best Strategy for the Management of Heart Failure and Chronic Kidney Disease Among Elderly Patients With or at High Risk of hyperKalemia in Span by Optimizing the Use of RAASi With SZC",
            "year": "2024"
          },
          "matched": [
            "NCT03036124"
          ],
          "statusText": "CT.gov: kept 20 trials after applying the 2015+ floor"
        },
        "openalex": {
          "anchorRecall": 0.4,
          "count": 20,
          "eligible": 5,
          "firstResult": {
            "doi": "10.1038/s41591-021-01659-1",
            "pmid": "35228754",
            "title": "The SGLT2 inhibitor empagliflozin in patients hospitalized for acute heart failure: a multinational randomized trial",
            "year": "2022"
          },
          "matched": [
            "NCT03036124",
            "NCT03057977"
          ],
          "statusText": "OpenAlex: kept 20 records after applying the 2015+ floor"
        },
        "pubmed": {
          "anchorRecall": 0.8,
          "count": 20,
          "eligible": 5,
          "firstResult": {
            "doi": "10.1016/j.jtcvs.2026.02.037",
            "pmid": "41831709",
            "title": "Sodium-glucose cotransporter 2 inhibitor use and outcomes after surgical aortic valve replacement.",
            "year": "2026"
          },
          "matched": [
            "NCT03036124",
            "NCT03057977",
            "NCT03057951",
            "NCT03619213"
          ],
          "statusText": "340 total results (PubMed: 20)"
        }
      },
      "status": "pass",
      "topicId": "sglt2i_hf_hfpef",
      "validationPackId": "sglt2i_hf_benchmark",
      "id": "sglt2i_hf_hfpef",
      "pack": {
        "id": "sglt2i_hf_benchmark",
        "meta": {
          "date": "2026-03-13",
          "id": "sglt2i_hf_benchmark",
          "name": "SGLT2 HF/CKD Golden Benchmark",
          "reference": {
            "journal": "Lancet",
            "title": "Vaduganathan et al. SGLT2 inhibitors in heart failure and kidney disease",
            "year": 2022
          },
          "summary": "Bundled golden HF and CKD benchmark outcomes aligned to Vaduganathan 2022 Lancet and CRES v5.0.",
          "tier": "exact",
          "verdict": "PASS"
        },
        "report_summary": null
      }
    },
    "sglt2i_ckd_renal": {
      "category": "Kidney Disease",
      "extraction": {
        "ctgov": {
          "has2x2": false,
          "hasReportedEffect": true,
          "hasResults": true,
          "matchScore": 97,
          "matchedOutcome": "Primary Composite Endpoint of Doubling of Serum Creatinine (DoSC), End-stage Kidney Disease (ESKD), and Renal or Cardiovascular (CV) Death",
          "recordExtract": "Primary Composite Endpoint of Doubling of Serum Creatinine (DoSC), End-stage Kidney Disease (ESKD), and Renal or Cardiovascular (CV) Death | Tx --/-- vs Ctrl --/--",
          "sampleNctId": "NCT02065791",
          "success": true
        },
        "pubmed": {
          "effectCount": 2,
          "firstExtract": "HR 10.68; 95%CI: 8.50-13.41",
          "pmid": "41765341",
          "success": true,
          "title": "SGLT2 inhibition in Patients with Type 2 Diabetes and CKD Experiencing a Deterioration in Estimated Glomerular Filtration Rate to <20ml/min/1.73m2."
        }
      },
      "failReasons": [
        "ctgov_anchor_recall"
      ],
      "name": "SGLT2 inhibitors - Chronic Kidney Disease - Renal composite",
      "policy": {
        "allowedSources": [
          "ctgov",
          "pubmed",
          "openalex"
        ],
        "extractionMode": "pubmed-abstract-and-ctgov-records-only",
        "pass": true,
        "pdfUploadHidden": true,
        "pdfViewerHidden": true,
        "yearFloor": 2015
      },
      "screening": {
        "humanCheckable": true,
        "recordsWithAnchors": 0
      },
      "search": {
        "ctgov": {
          "anchorRecall": 0,
          "count": 19,
          "eligible": 3,
          "firstResult": {
            "nctId": "NCT06578078",
            "title": "A Randomized Clinical Trial to Define the Best Strategy for the Management of Heart Failure and Chronic Kidney Disease Among Elderly Patients With or at High Risk of hyperKalemia in Span by Optimizing the Use of RAASi With SZC",
            "year": "2024"
          },
          "matched": [],
          "statusText": "CT.gov: kept 19 trials after applying the 2015+ floor"
        },
        "openalex": {
          "anchorRecall": 0.6666666666666666,
          "count": 20,
          "eligible": 3,
          "firstResult": {
            "doi": "10.1136/bmjdrc-2021-002484",
            "nctId": "NCT01986881",
            "pmid": "34620621",
            "title": "Glycemic efficacy and safety of the SGLT2 inhibitor ertugliflozin in patients with type 2 diabetes and stage 3 chronic kidney disease: an analysis from the VERTIS CV randomized trial",
            "year": "2021"
          },
          "matched": [
            "NCT03036150",
            "NCT02065791"
          ],
          "statusText": "OpenAlex: kept 20 records after applying the 2015+ floor"
        },
        "pubmed": {
          "anchorRecall": 1,
          "count": 20,
          "eligible": 3,
          "firstResult": {
            "doi": "10.1016/j.cardfail.2026.01.025",
            "nctId": "NCT05084235",
            "pmid": "41831639",
            "title": "The effect of empagliflozin on left ventricular mass and volumes in elderly individuals with overweight and high risk of heart failure: The Empire Prevent Cardiac Trial.",
            "year": "2026"
          },
          "matched": [
            "NCT03036150",
            "NCT02065791",
            "NCT03594110"
          ],
          "statusText": "399 total results (PubMed: 20)"
        }
      },
      "status": "warn",
      "topicId": "sglt2i_ckd_renal",
      "validationPackId": "sglt2i_hf_benchmark",
      "id": "sglt2i_ckd_renal",
      "pack": {
        "id": "sglt2i_hf_benchmark",
        "meta": {
          "date": "2026-03-13",
          "id": "sglt2i_hf_benchmark",
          "name": "SGLT2 HF/CKD Golden Benchmark",
          "reference": {
            "journal": "Lancet",
            "title": "Vaduganathan et al. SGLT2 inhibitors in heart failure and kidney disease",
            "year": 2022
          },
          "summary": "Bundled golden HF and CKD benchmark outcomes aligned to Vaduganathan 2022 Lancet and CRES v5.0.",
          "tier": "exact",
          "verdict": "PASS"
        },
        "report_summary": null
      }
    },
    "sglt2i_ckd_cv": {
      "category": "Kidney Disease",
      "extraction": {
        "ctgov": {
          "has2x2": false,
          "hasReportedEffect": true,
          "hasResults": true,
          "matchScore": 98,
          "matchedOutcome": "Composite Endpoint of CV Death and Hospitalized Heart Failure (HHF)",
          "recordExtract": "Composite Endpoint of CV Death and Hospitalized Heart Failure (HHF) | Tx --/-- vs Ctrl --/--",
          "sampleNctId": "NCT02065791",
          "success": true
        },
        "pubmed": {
          "effectCount": 2,
          "firstExtract": "HR 10.68; 95%CI: 8.50-13.41",
          "pmid": "41765341",
          "success": true,
          "title": "SGLT2 inhibition in Patients with Type 2 Diabetes and CKD Experiencing a Deterioration in Estimated Glomerular Filtration Rate to <20ml/min/1.73m2."
        }
      },
      "failReasons": [
        "ctgov_anchor_recall"
      ],
      "name": "SGLT2 inhibitors - Chronic Kidney Disease - Cardiorenal composite",
      "policy": {
        "allowedSources": [
          "ctgov",
          "pubmed",
          "openalex"
        ],
        "extractionMode": "pubmed-abstract-and-ctgov-records-only",
        "pass": true,
        "pdfUploadHidden": true,
        "pdfViewerHidden": true,
        "yearFloor": 2015
      },
      "screening": {
        "humanCheckable": true,
        "recordsWithAnchors": 0
      },
      "search": {
        "ctgov": {
          "anchorRecall": 0,
          "count": 19,
          "eligible": 3,
          "firstResult": {
            "nctId": "NCT06578078",
            "title": "A Randomized Clinical Trial to Define the Best Strategy for the Management of Heart Failure and Chronic Kidney Disease Among Elderly Patients With or at High Risk of hyperKalemia in Span by Optimizing the Use of RAASi With SZC",
            "year": "2024"
          },
          "matched": [],
          "statusText": "CT.gov: kept 19 trials after applying the 2015+ floor"
        },
        "openalex": {
          "anchorRecall": 0.6666666666666666,
          "count": 20,
          "eligible": 3,
          "firstResult": {
            "doi": "10.1136/bmjdrc-2021-002484",
            "nctId": "NCT01986881",
            "pmid": "34620621",
            "title": "Glycemic efficacy and safety of the SGLT2 inhibitor ertugliflozin in patients with type 2 diabetes and stage 3 chronic kidney disease: an analysis from the VERTIS CV randomized trial",
            "year": "2021"
          },
          "matched": [
            "NCT03036150",
            "NCT02065791"
          ],
          "statusText": "OpenAlex: kept 20 records after applying the 2015+ floor"
        },
        "pubmed": {
          "anchorRecall": 1,
          "count": 20,
          "eligible": 3,
          "firstResult": {
            "doi": "10.1016/j.cardfail.2026.01.025",
            "nctId": "NCT05084235",
            "pmid": "41831639",
            "title": "The effect of empagliflozin on left ventricular mass and volumes in elderly individuals with overweight and high risk of heart failure: The Empire Prevent Cardiac Trial.",
            "year": "2026"
          },
          "matched": [
            "NCT03036150",
            "NCT02065791",
            "NCT03594110"
          ],
          "statusText": "458 total results (PubMed: 20)"
        }
      },
      "status": "warn",
      "topicId": "sglt2i_ckd_cv",
      "validationPackId": "sglt2i_hf_benchmark",
      "id": "sglt2i_ckd_cv",
      "pack": {
        "id": "sglt2i_hf_benchmark",
        "meta": {
          "date": "2026-03-13",
          "id": "sglt2i_hf_benchmark",
          "name": "SGLT2 HF/CKD Golden Benchmark",
          "reference": {
            "journal": "Lancet",
            "title": "Vaduganathan et al. SGLT2 inhibitors in heart failure and kidney disease",
            "year": 2022
          },
          "summary": "Bundled golden HF and CKD benchmark outcomes aligned to Vaduganathan 2022 Lancet and CRES v5.0.",
          "tier": "exact",
          "verdict": "PASS"
        },
        "report_summary": null
      }
    },
    "sglt2i_ckd_allcause": {
      "category": "Kidney Disease",
      "extraction": {
        "ctgov": {
          "has2x2": false,
          "hasReportedEffect": true,
          "hasResults": true,
          "matchScore": 57,
          "matchedOutcome": "All-cause Mortality",
          "recordExtract": "All-cause Mortality | Tx --/-- vs Ctrl --/--",
          "sampleNctId": "NCT02065791",
          "success": true
        },
        "pubmed": {
          "effectCount": 2,
          "firstExtract": "HR 10.68; 95%CI: 8.50-13.41",
          "pmid": "41765341",
          "success": true,
          "title": "SGLT2 inhibition in Patients with Type 2 Diabetes and CKD Experiencing a Deterioration in Estimated Glomerular Filtration Rate to <20ml/min/1.73m2."
        }
      },
      "failReasons": [
        "ctgov_anchor_recall"
      ],
      "name": "SGLT2 inhibitors - Chronic Kidney Disease - All-cause mortality",
      "policy": {
        "allowedSources": [
          "ctgov",
          "pubmed",
          "openalex"
        ],
        "extractionMode": "pubmed-abstract-and-ctgov-records-only",
        "pass": true,
        "pdfUploadHidden": true,
        "pdfViewerHidden": true,
        "yearFloor": 2015
      },
      "screening": {
        "humanCheckable": true,
        "recordsWithAnchors": 0
      },
      "search": {
        "ctgov": {
          "anchorRecall": 0,
          "count": 19,
          "eligible": 3,
          "firstResult": {
            "nctId": "NCT06578078",
            "title": "A Randomized Clinical Trial to Define the Best Strategy for the Management of Heart Failure and Chronic Kidney Disease Among Elderly Patients With or at High Risk of hyperKalemia in Span by Optimizing the Use of RAASi With SZC",
            "year": "2024"
          },
          "matched": [],
          "statusText": "CT.gov: kept 19 trials after applying the 2015+ floor"
        },
        "openalex": {
          "anchorRecall": 0.6666666666666666,
          "count": 20,
          "eligible": 3,
          "firstResult": {
            "doi": "10.1136/bmjdrc-2021-002484",
            "nctId": "NCT01986881",
            "pmid": "34620621",
            "title": "Glycemic efficacy and safety of the SGLT2 inhibitor ertugliflozin in patients with type 2 diabetes and stage 3 chronic kidney disease: an analysis from the VERTIS CV randomized trial",
            "year": "2021"
          },
          "matched": [
            "NCT03036150",
            "NCT02065791"
          ],
          "statusText": "OpenAlex: kept 20 records after applying the 2015+ floor"
        },
        "pubmed": {
          "anchorRecall": 1,
          "count": 20,
          "eligible": 3,
          "firstResult": {
            "doi": "10.1016/j.cardfail.2026.01.025",
            "nctId": "NCT05084235",
            "pmid": "41831639",
            "title": "The effect of empagliflozin on left ventricular mass and volumes in elderly individuals with overweight and high risk of heart failure: The Empire Prevent Cardiac Trial.",
            "year": "2026"
          },
          "matched": [
            "NCT03036150",
            "NCT02065791",
            "NCT03594110"
          ],
          "statusText": "517 total results (PubMed: 20)"
        }
      },
      "status": "warn",
      "topicId": "sglt2i_ckd_allcause",
      "validationPackId": "sglt2i_hf_benchmark",
      "id": "sglt2i_ckd_allcause",
      "pack": {
        "id": "sglt2i_hf_benchmark",
        "meta": {
          "date": "2026-03-13",
          "id": "sglt2i_hf_benchmark",
          "name": "SGLT2 HF/CKD Golden Benchmark",
          "reference": {
            "journal": "Lancet",
            "title": "Vaduganathan et al. SGLT2 inhibitors in heart failure and kidney disease",
            "year": 2022
          },
          "summary": "Bundled golden HF and CKD benchmark outcomes aligned to Vaduganathan 2022 Lancet and CRES v5.0.",
          "tier": "exact",
          "verdict": "PASS"
        },
        "report_summary": null
      }
    },
    "sglt2i_ckd_diabetes": {
      "category": "Kidney Disease",
      "extraction": {
        "ctgov": {
          "has2x2": false,
          "hasReportedEffect": true,
          "hasResults": true,
          "matchScore": 67,
          "matchedOutcome": "Primary Composite Endpoint of Doubling of Serum Creatinine (DoSC), End-stage Kidney Disease (ESKD), and Renal or Cardiovascular (CV) Death",
          "recordExtract": "Primary Composite Endpoint of Doubling of Serum Creatinine (DoSC), End-stage Kidney Disease (ESKD), and Renal or Cardiovascular (CV) Death | Tx --/-- vs Ctrl --/--",
          "sampleNctId": "NCT02065791",
          "success": true
        },
        "pubmed": {
          "effectCount": 2,
          "firstExtract": "HR 10.68; 95%CI: 8.50-13.41",
          "pmid": "41765341",
          "success": true,
          "title": "SGLT2 inhibition in Patients with Type 2 Diabetes and CKD Experiencing a Deterioration in Estimated Glomerular Filtration Rate to <20ml/min/1.73m2."
        }
      },
      "failReasons": [
        "ctgov_anchor_recall"
      ],
      "name": "SGLT2 inhibitors - Chronic Kidney Disease - Diabetes subgroup",
      "policy": {
        "allowedSources": [
          "ctgov",
          "pubmed",
          "openalex"
        ],
        "extractionMode": "pubmed-abstract-and-ctgov-records-only",
        "pass": true,
        "pdfUploadHidden": true,
        "pdfViewerHidden": true,
        "yearFloor": 2015
      },
      "screening": {
        "humanCheckable": true,
        "recordsWithAnchors": 0
      },
      "search": {
        "ctgov": {
          "anchorRecall": 0,
          "count": 19,
          "eligible": 3,
          "firstResult": {
            "nctId": "NCT06578078",
            "title": "A Randomized Clinical Trial to Define the Best Strategy for the Management of Heart Failure and Chronic Kidney Disease Among Elderly Patients With or at High Risk of hyperKalemia in Span by Optimizing the Use of RAASi With SZC",
            "year": "2024"
          },
          "matched": [],
          "statusText": "CT.gov: kept 19 trials after applying the 2015+ floor"
        },
        "openalex": {
          "anchorRecall": 0.6666666666666666,
          "count": 20,
          "eligible": 3,
          "firstResult": {
            "doi": "10.1136/bmjdrc-2021-002484",
            "nctId": "NCT01986881",
            "pmid": "34620621",
            "title": "Glycemic efficacy and safety of the SGLT2 inhibitor ertugliflozin in patients with type 2 diabetes and stage 3 chronic kidney disease: an analysis from the VERTIS CV randomized trial",
            "year": "2021"
          },
          "matched": [
            "NCT03036150",
            "NCT02065791"
          ],
          "statusText": "OpenAlex: kept 20 records after applying the 2015+ floor"
        },
        "pubmed": {
          "anchorRecall": 1,
          "count": 20,
          "eligible": 3,
          "firstResult": {
            "doi": "10.1016/j.cardfail.2026.01.025",
            "nctId": "NCT05084235",
            "pmid": "41831639",
            "title": "The effect of empagliflozin on left ventricular mass and volumes in elderly individuals with overweight and high risk of heart failure: The Empire Prevent Cardiac Trial.",
            "year": "2026"
          },
          "matched": [
            "NCT03036150",
            "NCT02065791",
            "NCT03594110"
          ],
          "statusText": "576 total results (PubMed: 20)"
        }
      },
      "status": "warn",
      "topicId": "sglt2i_ckd_diabetes",
      "validationPackId": "sglt2i_hf_benchmark",
      "id": "sglt2i_ckd_diabetes",
      "pack": {
        "id": "sglt2i_hf_benchmark",
        "meta": {
          "date": "2026-03-13",
          "id": "sglt2i_hf_benchmark",
          "name": "SGLT2 HF/CKD Golden Benchmark",
          "reference": {
            "journal": "Lancet",
            "title": "Vaduganathan et al. SGLT2 inhibitors in heart failure and kidney disease",
            "year": 2022
          },
          "summary": "Bundled golden HF and CKD benchmark outcomes aligned to Vaduganathan 2022 Lancet and CRES v5.0.",
          "tier": "exact",
          "verdict": "PASS"
        },
        "report_summary": null
      }
    },
    "sglt2i_cvot_mace": {
      "category": "Cardiovascular Outcomes",
      "extraction": {
        "ctgov": {
          "has2x2": false,
          "hasReportedEffect": true,
          "hasResults": true,
          "matchScore": 45,
          "matchedOutcome": "Percentage of Participants With the Composite of All Events Adjudicated (4-point MACE): CV Death (Including Fatal Stroke and Fatal MI), Non-fatal MI (Excluding Silent MI), Non-fatal Stroke and Hospitalization for Unstable Angina Pectoris",
          "recordExtract": "Percentage of Participants With the Composite of All Events Adjudicated (4-point MACE): CV Death (Including Fatal Stroke and Fatal MI), Non-fatal MI (Excluding Silent MI), Non-fatal Stroke and Hospitalization for Unstable Angina Pectoris | Tx --/-- vs Ctrl --/--",
          "sampleNctId": "NCT01131676",
          "success": true
        },
        "pubmed": {
          "effectCount": 3,
          "firstExtract": "RR: 0.80, 95% CI 0.69-0.93",
          "pmid": "41789221",
          "success": true,
          "title": "A network meta-analysis of safety and efficacy of sodium-glucose cotransporter 2 inhibitors in heart failure patients."
        }
      },
      "failReasons": [
        "ctgov_anchor_recall"
      ],
      "name": "SGLT2 inhibitors - CVOT - MACE",
      "policy": {
        "allowedSources": [
          "ctgov",
          "pubmed",
          "openalex"
        ],
        "extractionMode": "pubmed-abstract-and-ctgov-records-only",
        "pass": true,
        "pdfUploadHidden": true,
        "pdfViewerHidden": true,
        "yearFloor": 2015
      },
      "screening": {
        "humanCheckable": true,
        "recordsWithAnchors": 0
      },
      "search": {
        "ctgov": {
          "anchorRecall": 0,
          "count": 17,
          "eligible": 4,
          "firstResult": {
            "nctId": "NCT07294495",
            "title": "A Randomized, Double-Blind, Placebo-Controlled Clinical Trial to Evaluate the Effect of Henagliflozin on Myocardial Fibrosis Burden in Patients With Non-Obstructive Hypertrophic Cardiomyopathy Using 68Ga/18F-FAPI PET/CMR",
            "year": "2026"
          },
          "matched": [],
          "statusText": "CT.gov: kept 17 trials after applying the 2015+ floor"
        },
        "openalex": {
          "anchorRecall": 0.75,
          "count": 20,
          "eligible": 4,
          "firstResult": {
            "doi": "10.1016/j.pcd.2020.08.017",
            "pmid": "32912710",
            "title": "Comparison of the effects of 10 GLP-1 RA and SGLT2 inhibitor interventions on cardiovascular, mortality, and kidney outcomes in type 2 diabetes: A network meta-analysis of large randomized trials",
            "year": "2020"
          },
          "matched": [
            "NCT01131676",
            "NCT01032629",
            "NCT01730534"
          ],
          "statusText": "OpenAlex: kept 20 records after applying the 2015+ floor"
        },
        "pubmed": {
          "anchorRecall": 0,
          "count": 20,
          "eligible": 4,
          "firstResult": {
            "doi": "10.1016/j.jtcvs.2026.02.037",
            "pmid": "41831709",
            "title": "Sodium-glucose cotransporter 2 inhibitor use and outcomes after surgical aortic valve replacement.",
            "year": "2026"
          },
          "matched": [],
          "statusText": "633 total results (PubMed: 20)"
        }
      },
      "status": "warn",
      "topicId": "sglt2i_cvot_mace",
      "validationPackId": "sglt2i_cvot_exact",
      "id": "sglt2i_cvot_mace",
      "pack": {
        "id": "sglt2i_cvot_exact",
        "meta": {
          "counts": {
            "checksPassed": 10,
            "checksTotal": 10,
            "k": 5,
            "totalN": 46969
          },
          "date": "2026-02-27",
          "id": "sglt2i_cvot_exact",
          "name": "SGLT2 CVOT Exact Replication",
          "reference": {
            "doi": "10.1001/jamacardio.2020.4511",
            "journal": "JAMA Cardiology",
            "pmid": "33031522",
            "title": "Association of SGLT2 Inhibitors With Cardiovascular and Kidney Outcomes in Patients With Type 2 Diabetes: A Meta-analysis",
            "year": 2021
          },
          "sourcePath": "validation/reports/exact_replication_sglt2i/exact_replication_sglt2i_report.json",
          "summary": "10/10 checks passed against the bundled SGLT2 cardiovascular outcomes meta-analysis benchmark.",
          "tier": "exact",
          "verdict": "PASS"
        },
        "report_summary": {
          "k": 5,
          "total_n": 46969,
          "checks_passed": 10,
          "checks_total": 10,
          "all_passed": true,
          "verdict": "PASS"
        }
      }
    },
    "sglt2i_cvot_hfh": {
      "category": "Cardiovascular Outcomes",
      "extraction": {
        "ctgov": {
          "has2x2": false,
          "hasReportedEffect": true,
          "hasResults": true,
          "matchScore": 75,
          "matchedOutcome": "Percentage of Participants With Heart Failure Requiring Hospitalisation (Adjudicated)",
          "recordExtract": "Percentage of Participants With Heart Failure Requiring Hospitalisation (Adjudicated) | Tx --/-- vs Ctrl --/--",
          "sampleNctId": "NCT01131676",
          "success": true
        },
        "pubmed": {
          "effectCount": 3,
          "firstExtract": "RR: 0.80, 95% CI 0.69-0.93",
          "pmid": "41789221",
          "success": true,
          "title": "A network meta-analysis of safety and efficacy of sodium-glucose cotransporter 2 inhibitors in heart failure patients."
        }
      },
      "failReasons": [
        "ctgov_anchor_recall"
      ],
      "name": "SGLT2 inhibitors - CVOT - HF hospitalization",
      "policy": {
        "allowedSources": [
          "ctgov",
          "pubmed",
          "openalex"
        ],
        "extractionMode": "pubmed-abstract-and-ctgov-records-only",
        "pass": true,
        "pdfUploadHidden": true,
        "pdfViewerHidden": true,
        "yearFloor": 2015
      },
      "screening": {
        "humanCheckable": true,
        "recordsWithAnchors": 0
      },
      "search": {
        "ctgov": {
          "anchorRecall": 0,
          "count": 17,
          "eligible": 4,
          "firstResult": {
            "nctId": "NCT07294495",
            "title": "A Randomized, Double-Blind, Placebo-Controlled Clinical Trial to Evaluate the Effect of Henagliflozin on Myocardial Fibrosis Burden in Patients With Non-Obstructive Hypertrophic Cardiomyopathy Using 68Ga/18F-FAPI PET/CMR",
            "year": "2026"
          },
          "matched": [],
          "statusText": "CT.gov: kept 17 trials after applying the 2015+ floor"
        },
        "openalex": {
          "anchorRecall": 0.75,
          "count": 20,
          "eligible": 4,
          "firstResult": {
            "doi": "10.1016/j.pcd.2020.08.017",
            "pmid": "32912710",
            "title": "Comparison of the effects of 10 GLP-1 RA and SGLT2 inhibitor interventions on cardiovascular, mortality, and kidney outcomes in type 2 diabetes: A network meta-analysis of large randomized trials",
            "year": "2020"
          },
          "matched": [
            "NCT01131676",
            "NCT01032629",
            "NCT01730534"
          ],
          "statusText": "OpenAlex: kept 20 records after applying the 2015+ floor"
        },
        "pubmed": {
          "anchorRecall": 0,
          "count": 20,
          "eligible": 4,
          "firstResult": {
            "doi": "10.1016/j.jtcvs.2026.02.037",
            "pmid": "41831709",
            "title": "Sodium-glucose cotransporter 2 inhibitor use and outcomes after surgical aortic valve replacement.",
            "year": "2026"
          },
          "matched": [],
          "statusText": "690 total results (PubMed: 20)"
        }
      },
      "status": "warn",
      "topicId": "sglt2i_cvot_hfh",
      "validationPackId": "sglt2i_cvot_exact",
      "id": "sglt2i_cvot_hfh",
      "pack": {
        "id": "sglt2i_cvot_exact",
        "meta": {
          "counts": {
            "checksPassed": 10,
            "checksTotal": 10,
            "k": 5,
            "totalN": 46969
          },
          "date": "2026-02-27",
          "id": "sglt2i_cvot_exact",
          "name": "SGLT2 CVOT Exact Replication",
          "reference": {
            "doi": "10.1001/jamacardio.2020.4511",
            "journal": "JAMA Cardiology",
            "pmid": "33031522",
            "title": "Association of SGLT2 Inhibitors With Cardiovascular and Kidney Outcomes in Patients With Type 2 Diabetes: A Meta-analysis",
            "year": 2021
          },
          "sourcePath": "validation/reports/exact_replication_sglt2i/exact_replication_sglt2i_report.json",
          "summary": "10/10 checks passed against the bundled SGLT2 cardiovascular outcomes meta-analysis benchmark.",
          "tier": "exact",
          "verdict": "PASS"
        },
        "report_summary": {
          "k": 5,
          "total_n": 46969,
          "checks_passed": 10,
          "checks_total": 10,
          "all_passed": true,
          "verdict": "PASS"
        }
      }
    },
    "sglt2i_cvot_cvdeath": {
      "category": "Cardiovascular Outcomes",
      "extraction": {
        "ctgov": {
          "has2x2": false,
          "hasReportedEffect": true,
          "hasResults": true,
          "matchScore": 73,
          "matchedOutcome": "Time to the First Occurrence of Any of the Following Adjudicated Components of the Primary Composite Endpoint (3-point MACE): CV Death (Including Fatal Stroke and Fatal MI), Non-fatal MI (Excluding Silent MI), and Non-fatal Stroke.",
          "recordExtract": "Time to the First Occurrence of Any of the Following Adjudicated Components of the Primary Composite Endpoint (3-point MACE): CV Death (Including Fatal Stroke and Fatal MI), Non-fatal MI (Excluding Silent MI), and Non-fatal Stroke. | Tx --/-- vs Ctrl --/--",
          "sampleNctId": "NCT01131676",
          "success": true
        },
        "pubmed": {
          "effectCount": 3,
          "firstExtract": "RR: 0.80, 95% CI 0.69-0.93",
          "pmid": "41789221",
          "success": true,
          "title": "A network meta-analysis of safety and efficacy of sodium-glucose cotransporter 2 inhibitors in heart failure patients."
        }
      },
      "failReasons": [
        "ctgov_anchor_recall"
      ],
      "name": "SGLT2 inhibitors - CVOT - CV death",
      "policy": {
        "allowedSources": [
          "ctgov",
          "pubmed",
          "openalex"
        ],
        "extractionMode": "pubmed-abstract-and-ctgov-records-only",
        "pass": true,
        "pdfUploadHidden": true,
        "pdfViewerHidden": true,
        "yearFloor": 2015
      },
      "screening": {
        "humanCheckable": true,
        "recordsWithAnchors": 0
      },
      "search": {
        "ctgov": {
          "anchorRecall": 0,
          "count": 17,
          "eligible": 4,
          "firstResult": {
            "nctId": "NCT07294495",
            "title": "A Randomized, Double-Blind, Placebo-Controlled Clinical Trial to Evaluate the Effect of Henagliflozin on Myocardial Fibrosis Burden in Patients With Non-Obstructive Hypertrophic Cardiomyopathy Using 68Ga/18F-FAPI PET/CMR",
            "year": "2026"
          },
          "matched": [],
          "statusText": "CT.gov: kept 17 trials after applying the 2015+ floor"
        },
        "openalex": {
          "anchorRecall": 0.75,
          "count": 20,
          "eligible": 4,
          "firstResult": {
            "doi": "10.1016/j.pcd.2020.08.017",
            "pmid": "32912710",
            "title": "Comparison of the effects of 10 GLP-1 RA and SGLT2 inhibitor interventions on cardiovascular, mortality, and kidney outcomes in type 2 diabetes: A network meta-analysis of large randomized trials",
            "year": "2020"
          },
          "matched": [
            "NCT01131676",
            "NCT01032629",
            "NCT01730534"
          ],
          "statusText": "OpenAlex: kept 20 records after applying the 2015+ floor"
        },
        "pubmed": {
          "anchorRecall": 0,
          "count": 20,
          "eligible": 4,
          "firstResult": {
            "doi": "10.1016/j.jtcvs.2026.02.037",
            "pmid": "41831709",
            "title": "Sodium-glucose cotransporter 2 inhibitor use and outcomes after surgical aortic valve replacement.",
            "year": "2026"
          },
          "matched": [],
          "statusText": "747 total results (PubMed: 20)"
        }
      },
      "status": "warn",
      "topicId": "sglt2i_cvot_cvdeath",
      "validationPackId": "sglt2i_cvot_exact",
      "id": "sglt2i_cvot_cvdeath",
      "pack": {
        "id": "sglt2i_cvot_exact",
        "meta": {
          "counts": {
            "checksPassed": 10,
            "checksTotal": 10,
            "k": 5,
            "totalN": 46969
          },
          "date": "2026-02-27",
          "id": "sglt2i_cvot_exact",
          "name": "SGLT2 CVOT Exact Replication",
          "reference": {
            "doi": "10.1001/jamacardio.2020.4511",
            "journal": "JAMA Cardiology",
            "pmid": "33031522",
            "title": "Association of SGLT2 Inhibitors With Cardiovascular and Kidney Outcomes in Patients With Type 2 Diabetes: A Meta-analysis",
            "year": 2021
          },
          "sourcePath": "validation/reports/exact_replication_sglt2i/exact_replication_sglt2i_report.json",
          "summary": "10/10 checks passed against the bundled SGLT2 cardiovascular outcomes meta-analysis benchmark.",
          "tier": "exact",
          "verdict": "PASS"
        },
        "report_summary": {
          "k": 5,
          "total_n": 46969,
          "checks_passed": 10,
          "checks_total": 10,
          "all_passed": true,
          "verdict": "PASS"
        }
      }
    },
    "sglt2i_cvot_allcause": {
      "category": "Cardiovascular Outcomes",
      "extraction": {
        "ctgov": {
          "has2x2": false,
          "hasReportedEffect": true,
          "hasResults": true,
          "matchScore": 43,
          "matchedOutcome": "Time to the First Occurrence of Any of the Following Adjudicated Components of the Primary Composite Endpoint (3-point MACE): CV Death (Including Fatal Stroke and Fatal MI), Non-fatal MI (Excluding Silent MI), and Non-fatal Stroke.",
          "recordExtract": "Time to the First Occurrence of Any of the Following Adjudicated Components of the Primary Composite Endpoint (3-point MACE): CV Death (Including Fatal Stroke and Fatal MI), Non-fatal MI (Excluding Silent MI), and Non-fatal Stroke. | Tx --/-- vs Ctrl --/--",
          "sampleNctId": "NCT01131676",
          "success": true
        },
        "pubmed": {
          "effectCount": 3,
          "firstExtract": "RR: 0.80, 95% CI 0.69-0.93",
          "pmid": "41789221",
          "success": true,
          "title": "A network meta-analysis of safety and efficacy of sodium-glucose cotransporter 2 inhibitors in heart failure patients."
        }
      },
      "failReasons": [
        "ctgov_anchor_recall"
      ],
      "name": "SGLT2 inhibitors - CVOT - All-cause mortality",
      "policy": {
        "allowedSources": [
          "ctgov",
          "pubmed",
          "openalex"
        ],
        "extractionMode": "pubmed-abstract-and-ctgov-records-only",
        "pass": true,
        "pdfUploadHidden": true,
        "pdfViewerHidden": true,
        "yearFloor": 2015
      },
      "screening": {
        "humanCheckable": true,
        "recordsWithAnchors": 0
      },
      "search": {
        "ctgov": {
          "anchorRecall": 0,
          "count": 17,
          "eligible": 4,
          "firstResult": {
            "nctId": "NCT07294495",
            "title": "A Randomized, Double-Blind, Placebo-Controlled Clinical Trial to Evaluate the Effect of Henagliflozin on Myocardial Fibrosis Burden in Patients With Non-Obstructive Hypertrophic Cardiomyopathy Using 68Ga/18F-FAPI PET/CMR",
            "year": "2026"
          },
          "matched": [],
          "statusText": "CT.gov: kept 17 trials after applying the 2015+ floor"
        },
        "openalex": {
          "anchorRecall": 0.75,
          "count": 20,
          "eligible": 4,
          "firstResult": {
            "doi": "10.1016/j.pcd.2020.08.017",
            "pmid": "32912710",
            "title": "Comparison of the effects of 10 GLP-1 RA and SGLT2 inhibitor interventions on cardiovascular, mortality, and kidney outcomes in type 2 diabetes: A network meta-analysis of large randomized trials",
            "year": "2020"
          },
          "matched": [
            "NCT01131676",
            "NCT01032629",
            "NCT01730534"
          ],
          "statusText": "OpenAlex: kept 20 records after applying the 2015+ floor"
        },
        "pubmed": {
          "anchorRecall": 0,
          "count": 20,
          "eligible": 4,
          "firstResult": {
            "doi": "10.1016/j.jtcvs.2026.02.037",
            "pmid": "41831709",
            "title": "Sodium-glucose cotransporter 2 inhibitor use and outcomes after surgical aortic valve replacement.",
            "year": "2026"
          },
          "matched": [],
          "statusText": "804 total results (PubMed: 20)"
        }
      },
      "status": "warn",
      "topicId": "sglt2i_cvot_allcause",
      "validationPackId": "sglt2i_cvot_exact",
      "id": "sglt2i_cvot_allcause",
      "pack": {
        "id": "sglt2i_cvot_exact",
        "meta": {
          "counts": {
            "checksPassed": 10,
            "checksTotal": 10,
            "k": 5,
            "totalN": 46969
          },
          "date": "2026-02-27",
          "id": "sglt2i_cvot_exact",
          "name": "SGLT2 CVOT Exact Replication",
          "reference": {
            "doi": "10.1001/jamacardio.2020.4511",
            "journal": "JAMA Cardiology",
            "pmid": "33031522",
            "title": "Association of SGLT2 Inhibitors With Cardiovascular and Kidney Outcomes in Patients With Type 2 Diabetes: A Meta-analysis",
            "year": 2021
          },
          "sourcePath": "validation/reports/exact_replication_sglt2i/exact_replication_sglt2i_report.json",
          "summary": "10/10 checks passed against the bundled SGLT2 cardiovascular outcomes meta-analysis benchmark.",
          "tier": "exact",
          "verdict": "PASS"
        },
        "report_summary": {
          "k": 5,
          "total_n": 46969,
          "checks_passed": 10,
          "checks_total": 10,
          "all_passed": true,
          "verdict": "PASS"
        }
      }
    },
    "finerenone_ckd_renal": {
      "category": "Kidney Disease",
      "extraction": {
        "ctgov": {
          "has2x2": false,
          "hasReportedEffect": false,
          "hasResults": true,
          "matchScore": 98,
          "matchedOutcome": "The First Occurrence of the Composite Endpoint of Onset of Kidney Failure, a Sustained Decrease of eGFR \u226540% From Baseline Over at Least 4 Weeks, or Renal Death.",
          "recordExtract": "The First Occurrence of the Composite Endpoint of Onset of Kidney Failure, a Sustained Decrease of eGFR \u226540% From Baseline Over at Least 4 Weeks, or Renal Death. | Tx --/-- vs Ctrl --/--",
          "sampleNctId": "NCT02545049",
          "success": false
        },
        "pubmed": {
          "effectCount": 1,
          "firstExtract": "HR: 1.29; 95% CI, 1.06-1.56",
          "pmid": "41679125",
          "success": true,
          "title": "Finerenone increases the likelihood of improved KDIGO risk category in patients with CKD and type 2 diabetes: An analysis from FIDELITY."
        }
      },
      "failReasons": [
        "ctgov_extract"
      ],
      "name": "Finerenone - CKD with Type 2 Diabetes - Renal composite",
      "policy": {
        "allowedSources": [
          "ctgov",
          "pubmed",
          "openalex"
        ],
        "extractionMode": "pubmed-abstract-and-ctgov-records-only",
        "pass": true,
        "pdfUploadHidden": true,
        "pdfViewerHidden": true,
        "yearFloor": 2015
      },
      "screening": {
        "humanCheckable": true,
        "recordsWithAnchors": 2
      },
      "search": {
        "ctgov": {
          "anchorRecall": 1,
          "count": 19,
          "eligible": 2,
          "firstResult": {
            "nctId": "NCT07348718",
            "title": "Rubix LS DKD Equity Registry (RUBIX-DKD): A Prospective Observational Patient Registry to Characterize Diabetic Kidney Disease Trajectories, Treatment Patterns, and Outcomes in Underserved Communities and to Enable a Future Embedded Phase IV Pragmatic Study",
            "year": "2025"
          },
          "matched": [
            "NCT02540993",
            "NCT02545049"
          ],
          "statusText": "CT.gov: kept 19 trials after applying the 2015+ floor"
        },
        "openalex": {
          "anchorRecall": 1,
          "count": 20,
          "eligible": 2,
          "firstResult": {
            "doi": "10.1093/ndt/gfae132",
            "pmid": "38858818",
            "title": "Design and baseline characteristics of the Finerenone, in addition to standard of care, on the progression of kidney disease in patients with Non-Diabetic Chronic Kidney Disease (FIND-CKD) randomized trial",
            "year": "2024"
          },
          "matched": [
            "NCT02540993",
            "NCT02545049"
          ],
          "statusText": "OpenAlex: kept 20 records after applying the 2015+ floor"
        },
        "pubmed": {
          "anchorRecall": 1,
          "count": 20,
          "eligible": 2,
          "firstResult": {
            "doi": "10.1056/NEJMoa2512854",
            "nctId": "NCT05901831",
            "pmid": "41780000",
            "title": "Finerenone in Type 1 Diabetes and Chronic Kidney Disease.",
            "year": "2026"
          },
          "matched": [
            "NCT02540993",
            "NCT02545049"
          ],
          "statusText": "863 total results (PubMed: 20)"
        }
      },
      "status": "warn",
      "topicId": "finerenone_ckd_renal",
      "validationPackId": "pairwise70_cardio",
      "id": "finerenone_ckd_renal",
      "pack": {
        "id": "pairwise70_cardio",
        "meta": {
          "counts": {
            "error": 0,
            "fail": 0,
            "pass": 45,
            "passRate": 100,
            "prepared": 45
          },
          "date": "2026-02-27",
          "id": "pairwise70_cardio",
          "name": "Pairwise70 Cardio End-to-End",
          "sourcePath": "validation/reports/pairwise70_cardio_benchmark/pairwise70_cardio_end_to_end_report.json",
          "summary": "45/45 prepared cardiovascular datasets passed using ClinicalTrials.gov, PubMed, and OpenAlex only, with no PDF extraction pipeline.",
          "tier": "domain",
          "verdict": "PASS"
        },
        "report_summary": {
          "scope": {
            "domain": "cardiovascular",
            "design": "RCT-focused Pairwise70 Cochrane study-level",
            "sources": [
              "ClinicalTrials.gov",
              "AACT",
              "PubMed",
              "OpenAlex"
            ],
            "pdf_pipeline_used": false
          },
          "counts": {
            "cardio_review_ids": 52,
            "cardio_dataset_files": 47,
            "prepared_datasets": 45,
            "skipped_datasets": 2,
            "pass": 45,
            "fail": 0,
            "error": 0,
            "pass_rate": 100.0
          },
          "elapsed_seconds": 9.37
        }
      }
    },
    "finerenone_ckd_cv": {
      "category": "Kidney Disease",
      "extraction": {
        "ctgov": {
          "has2x2": false,
          "hasReportedEffect": false,
          "hasResults": true,
          "matchScore": 98,
          "matchedOutcome": "The First Occurrence of the Composite Endpoint of Cardiovascular Death, Non-fatal Myocardial Infarction, Non Fatal Stroke, or Hospitalization for Heart Failure.",
          "recordExtract": "The First Occurrence of the Composite Endpoint of Cardiovascular Death, Non-fatal Myocardial Infarction, Non Fatal Stroke, or Hospitalization for Heart Failure. | Tx --/-- vs Ctrl --/--",
          "sampleNctId": "NCT02545049",
          "success": false
        },
        "pubmed": {
          "effectCount": 1,
          "firstExtract": "HR: 1.29; 95% CI, 1.06-1.56",
          "pmid": "41679125",
          "success": true,
          "title": "Finerenone increases the likelihood of improved KDIGO risk category in patients with CKD and type 2 diabetes: An analysis from FIDELITY."
        }
      },
      "failReasons": [
        "ctgov_extract"
      ],
      "name": "Finerenone - CKD with Type 2 Diabetes - CV composite",
      "policy": {
        "allowedSources": [
          "ctgov",
          "pubmed",
          "openalex"
        ],
        "extractionMode": "pubmed-abstract-and-ctgov-records-only",
        "pass": true,
        "pdfUploadHidden": true,
        "pdfViewerHidden": true,
        "yearFloor": 2015
      },
      "screening": {
        "humanCheckable": true,
        "recordsWithAnchors": 2
      },
      "search": {
        "ctgov": {
          "anchorRecall": 1,
          "count": 19,
          "eligible": 2,
          "firstResult": {
            "nctId": "NCT07348718",
            "title": "Rubix LS DKD Equity Registry (RUBIX-DKD): A Prospective Observational Patient Registry to Characterize Diabetic Kidney Disease Trajectories, Treatment Patterns, and Outcomes in Underserved Communities and to Enable a Future Embedded Phase IV Pragmatic Study",
            "year": "2025"
          },
          "matched": [
            "NCT02540993",
            "NCT02545049"
          ],
          "statusText": "CT.gov: kept 19 trials after applying the 2015+ floor"
        },
        "openalex": {
          "anchorRecall": 1,
          "count": 20,
          "eligible": 2,
          "firstResult": {
            "doi": "10.1093/ndt/gfae132",
            "pmid": "38858818",
            "title": "Design and baseline characteristics of the Finerenone, in addition to standard of care, on the progression of kidney disease in patients with Non-Diabetic Chronic Kidney Disease (FIND-CKD) randomized trial",
            "year": "2024"
          },
          "matched": [
            "NCT02540993",
            "NCT02545049"
          ],
          "statusText": "OpenAlex: kept 20 records after applying the 2015+ floor"
        },
        "pubmed": {
          "anchorRecall": 1,
          "count": 20,
          "eligible": 2,
          "firstResult": {
            "doi": "10.1056/NEJMoa2512854",
            "nctId": "NCT05901831",
            "pmid": "41780000",
            "title": "Finerenone in Type 1 Diabetes and Chronic Kidney Disease.",
            "year": "2026"
          },
          "matched": [
            "NCT02540993",
            "NCT02545049"
          ],
          "statusText": "922 total results (PubMed: 20)"
        }
      },
      "status": "warn",
      "topicId": "finerenone_ckd_cv",
      "validationPackId": "pairwise70_cardio",
      "id": "finerenone_ckd_cv",
      "pack": {
        "id": "pairwise70_cardio",
        "meta": {
          "counts": {
            "error": 0,
            "fail": 0,
            "pass": 45,
            "passRate": 100,
            "prepared": 45
          },
          "date": "2026-02-27",
          "id": "pairwise70_cardio",
          "name": "Pairwise70 Cardio End-to-End",
          "sourcePath": "validation/reports/pairwise70_cardio_benchmark/pairwise70_cardio_end_to_end_report.json",
          "summary": "45/45 prepared cardiovascular datasets passed using ClinicalTrials.gov, PubMed, and OpenAlex only, with no PDF extraction pipeline.",
          "tier": "domain",
          "verdict": "PASS"
        },
        "report_summary": {
          "scope": {
            "domain": "cardiovascular",
            "design": "RCT-focused Pairwise70 Cochrane study-level",
            "sources": [
              "ClinicalTrials.gov",
              "AACT",
              "PubMed",
              "OpenAlex"
            ],
            "pdf_pipeline_used": false
          },
          "counts": {
            "cardio_review_ids": 52,
            "cardio_dataset_files": 47,
            "prepared_datasets": 45,
            "skipped_datasets": 2,
            "pass": 45,
            "fail": 0,
            "error": 0,
            "pass_rate": 100.0
          },
          "elapsed_seconds": 9.37
        }
      }
    },
    "finerenone_ckd_hyperkalemia": {
      "category": "Kidney Disease",
      "extraction": {
        "ctgov": {
          "has2x2": false,
          "hasReportedEffect": false,
          "hasResults": true,
          "matchScore": 15,
          "matchedOutcome": "The First Occurrence of the Composite Endpoint of Cardiovascular Death, Non-fatal Myocardial Infarction, Non Fatal Stroke, or Hospitalization for Heart Failure.",
          "recordExtract": "The First Occurrence of the Composite Endpoint of Cardiovascular Death, Non-fatal Myocardial Infarction, Non Fatal Stroke, or Hospitalization for Heart Failure. | Tx --/-- vs Ctrl --/--",
          "sampleNctId": "NCT02545049",
          "success": false
        },
        "pubmed": {
          "effectCount": 1,
          "firstExtract": "HR: 1.29; 95% CI, 1.06-1.56",
          "pmid": "41679125",
          "success": true,
          "title": "Finerenone increases the likelihood of improved KDIGO risk category in patients with CKD and type 2 diabetes: An analysis from FIDELITY."
        }
      },
      "failReasons": [
        "ctgov_extract"
      ],
      "name": "Finerenone - CKD with Type 2 Diabetes - Hyperkalemia safety",
      "policy": {
        "allowedSources": [
          "ctgov",
          "pubmed",
          "openalex"
        ],
        "extractionMode": "pubmed-abstract-and-ctgov-records-only",
        "pass": true,
        "pdfUploadHidden": true,
        "pdfViewerHidden": true,
        "yearFloor": 2015
      },
      "screening": {
        "humanCheckable": true,
        "recordsWithAnchors": 2
      },
      "search": {
        "ctgov": {
          "anchorRecall": 1,
          "count": 19,
          "eligible": 2,
          "firstResult": {
            "nctId": "NCT07348718",
            "title": "Rubix LS DKD Equity Registry (RUBIX-DKD): A Prospective Observational Patient Registry to Characterize Diabetic Kidney Disease Trajectories, Treatment Patterns, and Outcomes in Underserved Communities and to Enable a Future Embedded Phase IV Pragmatic Study",
            "year": "2025"
          },
          "matched": [
            "NCT02540993",
            "NCT02545049"
          ],
          "statusText": "CT.gov: kept 19 trials after applying the 2015+ floor"
        },
        "openalex": {
          "anchorRecall": 1,
          "count": 20,
          "eligible": 2,
          "firstResult": {
            "doi": "10.1093/ndt/gfae132",
            "pmid": "38858818",
            "title": "Design and baseline characteristics of the Finerenone, in addition to standard of care, on the progression of kidney disease in patients with Non-Diabetic Chronic Kidney Disease (FIND-CKD) randomized trial",
            "year": "2024"
          },
          "matched": [
            "NCT02540993",
            "NCT02545049"
          ],
          "statusText": "OpenAlex: kept 20 records after applying the 2015+ floor"
        },
        "pubmed": {
          "anchorRecall": 1,
          "count": 20,
          "eligible": 2,
          "firstResult": {
            "doi": "10.1056/NEJMoa2512854",
            "nctId": "NCT05901831",
            "pmid": "41780000",
            "title": "Finerenone in Type 1 Diabetes and Chronic Kidney Disease.",
            "year": "2026"
          },
          "matched": [
            "NCT02540993",
            "NCT02545049"
          ],
          "statusText": "981 total results (PubMed: 20)"
        }
      },
      "status": "warn",
      "topicId": "finerenone_ckd_hyperkalemia",
      "validationPackId": "pairwise70_cardio",
      "id": "finerenone_ckd_hyperkalemia",
      "pack": {
        "id": "pairwise70_cardio",
        "meta": {
          "counts": {
            "error": 0,
            "fail": 0,
            "pass": 45,
            "passRate": 100,
            "prepared": 45
          },
          "date": "2026-02-27",
          "id": "pairwise70_cardio",
          "name": "Pairwise70 Cardio End-to-End",
          "sourcePath": "validation/reports/pairwise70_cardio_benchmark/pairwise70_cardio_end_to_end_report.json",
          "summary": "45/45 prepared cardiovascular datasets passed using ClinicalTrials.gov, PubMed, and OpenAlex only, with no PDF extraction pipeline.",
          "tier": "domain",
          "verdict": "PASS"
        },
        "report_summary": {
          "scope": {
            "domain": "cardiovascular",
            "design": "RCT-focused Pairwise70 Cochrane study-level",
            "sources": [
              "ClinicalTrials.gov",
              "AACT",
              "PubMed",
              "OpenAlex"
            ],
            "pdf_pipeline_used": false
          },
          "counts": {
            "cardio_review_ids": 52,
            "cardio_dataset_files": 47,
            "prepared_datasets": 45,
            "skipped_datasets": 2,
            "pass": 45,
            "fail": 0,
            "error": 0,
            "pass_rate": 100.0
          },
          "elapsed_seconds": 9.37
        }
      }
    },
    "incretin_hfpef_kccq": {
      "category": "Heart Failure",
      "extraction": {
        "ctgov": {
          "has2x2": false,
          "hasReportedEffect": false,
          "hasResults": true,
          "matchScore": 98,
          "matchedOutcome": "Change From Baseline in the Kansas City Cardiomyopathy Questionnaire (KCCQ) Clinical Summary Score (CSS)",
          "recordExtract": "Change From Baseline in the Kansas City Cardiomyopathy Questionnaire (KCCQ) Clinical Summary Score (CSS) | Tx --/-- vs Ctrl --/--",
          "sampleNctId": "NCT04847557",
          "success": false
        },
        "pubmed": {
          "effectCount": 1,
          "firstExtract": "odds ratio: 11.37 (95% confidence interval: 8.10-15.98",
          "pmid": "41824845",
          "success": true,
          "title": "GLP-1 receptor agonists for weight loss: A systematic review and meta-analysis of randomized controlled trials."
        }
      },
      "failReasons": [
        "ctgov_anchor_recall",
        "ctgov_extract"
      ],
      "name": "Incretin therapies - HFpEF and obesity - KCCQ clinical status",
      "policy": {
        "allowedSources": [
          "ctgov",
          "pubmed",
          "openalex"
        ],
        "extractionMode": "pubmed-abstract-and-ctgov-records-only",
        "pass": true,
        "pdfUploadHidden": true,
        "pdfViewerHidden": true,
        "yearFloor": 2015
      },
      "screening": {
        "humanCheckable": true,
        "recordsWithAnchors": 0
      },
      "search": {
        "ctgov": {
          "anchorRecall": 0,
          "count": 16,
          "eligible": 3,
          "firstResult": {
            "nctId": "NCT05598008",
            "title": "The Desire PLUS Study - Effects of Glucagon-like-Peptide-1 Analogues on Sexuality: a Prospective Open-label Study",
            "year": "2022"
          },
          "matched": [],
          "statusText": "CT.gov: kept 16 trials after applying the 2015+ floor"
        },
        "openalex": {
          "anchorRecall": 1,
          "count": 20,
          "eligible": 3,
          "firstResult": {
            "doi": "10.1093/eurheartj/ehad192",
            "pmid": "37622663",
            "title": "2023 ESC Guidelines for the management of cardiovascular disease in patients with diabetes",
            "year": "2023"
          },
          "matched": [
            "NCT04788511",
            "NCT04916470",
            "NCT04847557"
          ],
          "statusText": "OpenAlex: kept 20 records after applying the 2015+ floor"
        },
        "pubmed": {
          "anchorRecall": 0.6666666666666666,
          "count": 20,
          "eligible": 3,
          "firstResult": {
            "doi": "10.1097/MD.0000000000047994",
            "pmid": "41824845",
            "title": "GLP-1 receptor agonists for weight loss: A systematic review and meta-analysis of randomized controlled trials.",
            "year": "2026"
          },
          "matched": [
            "NCT04788511",
            "NCT04916470"
          ],
          "statusText": "1037 total results (PubMed: 20)"
        }
      },
      "status": "warn",
      "topicId": "incretin_hfpef_kccq",
      "validationPackId": "pairwise70_cardio",
      "id": "incretin_hfpef_kccq",
      "pack": {
        "id": "pairwise70_cardio",
        "meta": {
          "counts": {
            "error": 0,
            "fail": 0,
            "pass": 45,
            "passRate": 100,
            "prepared": 45
          },
          "date": "2026-02-27",
          "id": "pairwise70_cardio",
          "name": "Pairwise70 Cardio End-to-End",
          "sourcePath": "validation/reports/pairwise70_cardio_benchmark/pairwise70_cardio_end_to_end_report.json",
          "summary": "45/45 prepared cardiovascular datasets passed using ClinicalTrials.gov, PubMed, and OpenAlex only, with no PDF extraction pipeline.",
          "tier": "domain",
          "verdict": "PASS"
        },
        "report_summary": {
          "scope": {
            "domain": "cardiovascular",
            "design": "RCT-focused Pairwise70 Cochrane study-level",
            "sources": [
              "ClinicalTrials.gov",
              "AACT",
              "PubMed",
              "OpenAlex"
            ],
            "pdf_pipeline_used": false
          },
          "counts": {
            "cardio_review_ids": 52,
            "cardio_dataset_files": 47,
            "prepared_datasets": 45,
            "skipped_datasets": 2,
            "pass": 45,
            "fail": 0,
            "error": 0,
            "pass_rate": 100.0
          },
          "elapsed_seconds": 9.37
        }
      }
    },
    "incretin_hfpef_weight": {
      "category": "Heart Failure",
      "extraction": {
        "ctgov": {
          "has2x2": false,
          "hasReportedEffect": false,
          "hasResults": true,
          "matchScore": 39,
          "matchedOutcome": "Percent Change From Baseline in Body Weight",
          "recordExtract": "Percent Change From Baseline in Body Weight | Tx --/-- vs Ctrl --/--",
          "sampleNctId": "NCT04847557",
          "success": false
        },
        "pubmed": {
          "effectCount": 1,
          "firstExtract": "odds ratio: 11.37 (95% confidence interval: 8.10-15.98",
          "pmid": "41824845",
          "success": true,
          "title": "GLP-1 receptor agonists for weight loss: A systematic review and meta-analysis of randomized controlled trials."
        }
      },
      "failReasons": [
        "ctgov_anchor_recall",
        "ctgov_extract"
      ],
      "name": "Incretin therapies - HFpEF and obesity - Body weight",
      "policy": {
        "allowedSources": [
          "ctgov",
          "pubmed",
          "openalex"
        ],
        "extractionMode": "pubmed-abstract-and-ctgov-records-only",
        "pass": true,
        "pdfUploadHidden": true,
        "pdfViewerHidden": true,
        "yearFloor": 2015
      },
      "screening": {
        "humanCheckable": true,
        "recordsWithAnchors": 0
      },
      "search": {
        "ctgov": {
          "anchorRecall": 0,
          "count": 16,
          "eligible": 3,
          "firstResult": {
            "nctId": "NCT05598008",
            "title": "The Desire PLUS Study - Effects of Glucagon-like-Peptide-1 Analogues on Sexuality: a Prospective Open-label Study",
            "year": "2022"
          },
          "matched": [],
          "statusText": "CT.gov: kept 16 trials after applying the 2015+ floor"
        },
        "openalex": {
          "anchorRecall": 1,
          "count": 20,
          "eligible": 3,
          "firstResult": {
            "doi": "10.1093/eurheartj/ehad192",
            "pmid": "37622663",
            "title": "2023 ESC Guidelines for the management of cardiovascular disease in patients with diabetes",
            "year": "2023"
          },
          "matched": [
            "NCT04788511",
            "NCT04916470",
            "NCT04847557"
          ],
          "statusText": "OpenAlex: kept 20 records after applying the 2015+ floor"
        },
        "pubmed": {
          "anchorRecall": 0.6666666666666666,
          "count": 20,
          "eligible": 3,
          "firstResult": {
            "doi": "10.1097/MD.0000000000047994",
            "pmid": "41824845",
            "title": "GLP-1 receptor agonists for weight loss: A systematic review and meta-analysis of randomized controlled trials.",
            "year": "2026"
          },
          "matched": [
            "NCT04788511",
            "NCT04916470"
          ],
          "statusText": "1093 total results (PubMed: 20)"
        }
      },
      "status": "warn",
      "topicId": "incretin_hfpef_weight",
      "validationPackId": "pairwise70_cardio",
      "id": "incretin_hfpef_weight",
      "pack": {
        "id": "pairwise70_cardio",
        "meta": {
          "counts": {
            "error": 0,
            "fail": 0,
            "pass": 45,
            "passRate": 100,
            "prepared": 45
          },
          "date": "2026-02-27",
          "id": "pairwise70_cardio",
          "name": "Pairwise70 Cardio End-to-End",
          "sourcePath": "validation/reports/pairwise70_cardio_benchmark/pairwise70_cardio_end_to_end_report.json",
          "summary": "45/45 prepared cardiovascular datasets passed using ClinicalTrials.gov, PubMed, and OpenAlex only, with no PDF extraction pipeline.",
          "tier": "domain",
          "verdict": "PASS"
        },
        "report_summary": {
          "scope": {
            "domain": "cardiovascular",
            "design": "RCT-focused Pairwise70 Cochrane study-level",
            "sources": [
              "ClinicalTrials.gov",
              "AACT",
              "PubMed",
              "OpenAlex"
            ],
            "pdf_pipeline_used": false
          },
          "counts": {
            "cardio_review_ids": 52,
            "cardio_dataset_files": 47,
            "prepared_datasets": 45,
            "skipped_datasets": 2,
            "pass": 45,
            "fail": 0,
            "error": 0,
            "pass_rate": 100.0
          },
          "elapsed_seconds": 9.37
        }
      }
    },
    "incretin_hfpef_totalhf": {
      "category": "Heart Failure",
      "extraction": {
        "ctgov": {
          "has2x2": false,
          "hasReportedEffect": false,
          "hasResults": true,
          "matchScore": 57,
          "matchedOutcome": "First Occurrence of the Composite Endpoint of Heart Failure (HF) Outcomes",
          "recordExtract": "First Occurrence of the Composite Endpoint of Heart Failure (HF) Outcomes | Tx --/-- vs Ctrl --/--",
          "sampleNctId": "NCT04847557",
          "success": false
        },
        "pubmed": {
          "effectCount": 1,
          "firstExtract": "odds ratio: 11.37 (95% confidence interval: 8.10-15.98",
          "pmid": "41824845",
          "success": true,
          "title": "GLP-1 receptor agonists for weight loss: A systematic review and meta-analysis of randomized controlled trials."
        }
      },
      "failReasons": [
        "ctgov_anchor_recall",
        "ctgov_extract"
      ],
      "name": "Incretin therapies - HFpEF and obesity - HF events",
      "policy": {
        "allowedSources": [
          "ctgov",
          "pubmed",
          "openalex"
        ],
        "extractionMode": "pubmed-abstract-and-ctgov-records-only",
        "pass": true,
        "pdfUploadHidden": true,
        "pdfViewerHidden": true,
        "yearFloor": 2015
      },
      "screening": {
        "humanCheckable": true,
        "recordsWithAnchors": 0
      },
      "search": {
        "ctgov": {
          "anchorRecall": 0,
          "count": 16,
          "eligible": 3,
          "firstResult": {
            "nctId": "NCT05598008",
            "title": "The Desire PLUS Study - Effects of Glucagon-like-Peptide-1 Analogues on Sexuality: a Prospective Open-label Study",
            "year": "2022"
          },
          "matched": [],
          "statusText": "CT.gov: kept 16 trials after applying the 2015+ floor"
        },
        "openalex": {
          "anchorRecall": 1,
          "count": 20,
          "eligible": 3,
          "firstResult": {
            "doi": "10.1093/eurheartj/ehad192",
            "pmid": "37622663",
            "title": "2023 ESC Guidelines for the management of cardiovascular disease in patients with diabetes",
            "year": "2023"
          },
          "matched": [
            "NCT04788511",
            "NCT04916470",
            "NCT04847557"
          ],
          "statusText": "OpenAlex: kept 20 records after applying the 2015+ floor"
        },
        "pubmed": {
          "anchorRecall": 0.6666666666666666,
          "count": 20,
          "eligible": 3,
          "firstResult": {
            "doi": "10.1097/MD.0000000000047994",
            "pmid": "41824845",
            "title": "GLP-1 receptor agonists for weight loss: A systematic review and meta-analysis of randomized controlled trials.",
            "year": "2026"
          },
          "matched": [
            "NCT04788511",
            "NCT04916470"
          ],
          "statusText": "1149 total results (PubMed: 20)"
        }
      },
      "status": "warn",
      "topicId": "incretin_hfpef_totalhf",
      "validationPackId": "pairwise70_cardio",
      "id": "incretin_hfpef_totalhf",
      "pack": {
        "id": "pairwise70_cardio",
        "meta": {
          "counts": {
            "error": 0,
            "fail": 0,
            "pass": 45,
            "passRate": 100,
            "prepared": 45
          },
          "date": "2026-02-27",
          "id": "pairwise70_cardio",
          "name": "Pairwise70 Cardio End-to-End",
          "sourcePath": "validation/reports/pairwise70_cardio_benchmark/pairwise70_cardio_end_to_end_report.json",
          "summary": "45/45 prepared cardiovascular datasets passed using ClinicalTrials.gov, PubMed, and OpenAlex only, with no PDF extraction pipeline.",
          "tier": "domain",
          "verdict": "PASS"
        },
        "report_summary": {
          "scope": {
            "domain": "cardiovascular",
            "design": "RCT-focused Pairwise70 Cochrane study-level",
            "sources": [
              "ClinicalTrials.gov",
              "AACT",
              "PubMed",
              "OpenAlex"
            ],
            "pdf_pipeline_used": false
          },
          "counts": {
            "cardio_review_ids": 52,
            "cardio_dataset_files": 47,
            "prepared_datasets": 45,
            "skipped_datasets": 2,
            "pass": 45,
            "fail": 0,
            "error": 0,
            "pass_rate": 100.0
          },
          "elapsed_seconds": 9.37
        }
      }
    },
    "glp1_cvot_mace": {
      "category": "Cardiovascular Outcomes",
      "extraction": {
        "ctgov": {
          "has2x2": false,
          "hasReportedEffect": false,
          "hasResults": true,
          "matchScore": 98,
          "matchedOutcome": "Time to First Occurrence of Major Adverse Cardiovascular Events (MACE): Event Rate Per 100 Participant-years for First Occurrence of Major Cardiovascular (CV) Event - Non-Inferiority Analysis",
          "recordExtract": "Time to First Occurrence of Major Adverse Cardiovascular Events (MACE): Event Rate Per 100 Participant-years for First Occurrence of Major Cardiovascular (CV) Event - Non-Inferiority Analysis | Tx --/-- vs Ctrl --/--",
          "sampleNctId": "NCT03496298",
          "success": false
        },
        "pubmed": {
          "effectCount": 1,
          "firstExtract": "HR 1.14 [95% CI, 0.89-1.46]",
          "pmid": "41711744",
          "success": true,
          "title": "Semaglutide vs tirzepatide in patients with obesity and HFpEF: a report from a global federated research network."
        }
      },
      "failReasons": [
        "ctgov_extract"
      ],
      "name": "GLP-1 receptor agonists - CVOT - MACE",
      "policy": {
        "allowedSources": [
          "ctgov",
          "pubmed",
          "openalex"
        ],
        "extractionMode": "pubmed-abstract-and-ctgov-records-only",
        "pass": true,
        "pdfUploadHidden": true,
        "pdfViewerHidden": true,
        "yearFloor": 2015
      },
      "screening": {
        "humanCheckable": true,
        "recordsWithAnchors": 1
      },
      "search": {
        "ctgov": {
          "anchorRecall": 0.125,
          "count": 16,
          "eligible": 8,
          "firstResult": {
            "nctId": "NCT05819138",
            "title": "Type 1 Diabetes Impacts of Semaglutide on Cardiovascular Outcomes",
            "year": "2023"
          },
          "matched": [
            "NCT02465515"
          ],
          "statusText": "CT.gov: kept 16 trials after applying the 2015+ floor"
        },
        "openalex": {
          "anchorRecall": 0.625,
          "count": 20,
          "eligible": 8,
          "firstResult": {
            "doi": "10.23736/s2724-6507.20.03219-8",
            "title": "Pancreatitis and pancreatic cancer in patients with type 2 diabetes treated with glucagon-like peptide-1 receptor agonists: an updated meta-analysis of randomized controlled trials",
            "year": "2023"
          },
          "matched": [
            "NCT01179048",
            "NCT01720446",
            "NCT01144338",
            "NCT01394952",
            "NCT03496298"
          ],
          "statusText": "OpenAlex: kept 20 records after applying the 2015+ floor"
        },
        "pubmed": {
          "anchorRecall": 0.25,
          "count": 20,
          "eligible": 8,
          "firstResult": {
            "doi": "10.59556/japi.74.1375",
            "pmid": "41818087",
            "title": "National Consensus on Semaglutide in Cardiology: From Clinical Evidence to Clinical Translation.",
            "year": "2026"
          },
          "matched": [
            "NCT01720446",
            "NCT02692716"
          ],
          "statusText": "1205 total results (PubMed: 20)"
        }
      },
      "status": "warn",
      "topicId": "glp1_cvot_mace",
      "validationPackId": "glp1_cvot_exact",
      "id": "glp1_cvot_mace",
      "pack": {
        "id": "glp1_cvot_exact",
        "meta": {
          "counts": {
            "checksPassed": 11,
            "checksTotal": 11,
            "k": 10,
            "totalN": 73263
          },
          "date": "2026-02-27",
          "id": "glp1_cvot_exact",
          "name": "GLP-1 CVOT Exact Replication",
          "reference": {
            "doi": "10.1111/dom.70121",
            "journal": "Diabetes, Obesity & Metabolism",
            "pmid": "40926380",
            "title": "Cardiovascular risk reduction with GLP-1 receptor agonists is proportional to HbA1c lowering in type 2 diabetes",
            "year": 2025
          },
          "sourcePath": "validation/reports/exact_replication_glp1/exact_replication_glp1_report.json",
          "summary": "11/11 checks passed against the bundled GLP-1 cardiovascular outcomes meta-analysis benchmark.",
          "tier": "exact",
          "verdict": "PASS"
        },
        "report_summary": {
          "k": 10,
          "total_n": 73263,
          "checks_passed": 11,
          "checks_total": 11,
          "all_passed": true,
          "verdict": "PASS"
        }
      }
    },
    "glp1_cvot_stroke": {
      "category": "Cardiovascular Outcomes",
      "extraction": {
        "ctgov": {
          "has2x2": false,
          "hasReportedEffect": false,
          "hasResults": true,
          "matchScore": 33,
          "matchedOutcome": "Time to First Occurrence of Major Adverse Cardiovascular Events (MACE): Event Rate Per 100 Participant-years for First Occurrence of Major Cardiovascular (CV) Event - Non-Inferiority Analysis",
          "recordExtract": "Time to First Occurrence of Major Adverse Cardiovascular Events (MACE): Event Rate Per 100 Participant-years for First Occurrence of Major Cardiovascular (CV) Event - Non-Inferiority Analysis | Tx --/-- vs Ctrl --/--",
          "sampleNctId": "NCT03496298",
          "success": false
        },
        "pubmed": {
          "effectCount": 1,
          "firstExtract": "HR 1.14 [95% CI, 0.89-1.46]",
          "pmid": "41711744",
          "success": true,
          "title": "Semaglutide vs tirzepatide in patients with obesity and HFpEF: a report from a global federated research network."
        }
      },
      "failReasons": [
        "ctgov_extract"
      ],
      "name": "GLP-1 receptor agonists - CVOT - Stroke",
      "policy": {
        "allowedSources": [
          "ctgov",
          "pubmed",
          "openalex"
        ],
        "extractionMode": "pubmed-abstract-and-ctgov-records-only",
        "pass": true,
        "pdfUploadHidden": true,
        "pdfViewerHidden": true,
        "yearFloor": 2015
      },
      "screening": {
        "humanCheckable": true,
        "recordsWithAnchors": 1
      },
      "search": {
        "ctgov": {
          "anchorRecall": 0.125,
          "count": 16,
          "eligible": 8,
          "firstResult": {
            "nctId": "NCT05819138",
            "title": "Type 1 Diabetes Impacts of Semaglutide on Cardiovascular Outcomes",
            "year": "2023"
          },
          "matched": [
            "NCT02465515"
          ],
          "statusText": "CT.gov: kept 16 trials after applying the 2015+ floor"
        },
        "openalex": {
          "anchorRecall": 0.625,
          "count": 20,
          "eligible": 8,
          "firstResult": {
            "doi": "10.23736/s2724-6507.20.03219-8",
            "title": "Pancreatitis and pancreatic cancer in patients with type 2 diabetes treated with glucagon-like peptide-1 receptor agonists: an updated meta-analysis of randomized controlled trials",
            "year": "2023"
          },
          "matched": [
            "NCT01179048",
            "NCT01720446",
            "NCT01144338",
            "NCT01394952",
            "NCT03496298"
          ],
          "statusText": "OpenAlex: kept 20 records after applying the 2015+ floor"
        },
        "pubmed": {
          "anchorRecall": 0.25,
          "count": 20,
          "eligible": 8,
          "firstResult": {
            "doi": "10.59556/japi.74.1375",
            "pmid": "41818087",
            "title": "National Consensus on Semaglutide in Cardiology: From Clinical Evidence to Clinical Translation.",
            "year": "2026"
          },
          "matched": [
            "NCT01720446",
            "NCT02692716"
          ],
          "statusText": "1261 total results (PubMed: 20)"
        }
      },
      "status": "warn",
      "topicId": "glp1_cvot_stroke",
      "validationPackId": "glp1_cvot_exact",
      "id": "glp1_cvot_stroke",
      "pack": {
        "id": "glp1_cvot_exact",
        "meta": {
          "counts": {
            "checksPassed": 11,
            "checksTotal": 11,
            "k": 10,
            "totalN": 73263
          },
          "date": "2026-02-27",
          "id": "glp1_cvot_exact",
          "name": "GLP-1 CVOT Exact Replication",
          "reference": {
            "doi": "10.1111/dom.70121",
            "journal": "Diabetes, Obesity & Metabolism",
            "pmid": "40926380",
            "title": "Cardiovascular risk reduction with GLP-1 receptor agonists is proportional to HbA1c lowering in type 2 diabetes",
            "year": 2025
          },
          "sourcePath": "validation/reports/exact_replication_glp1/exact_replication_glp1_report.json",
          "summary": "11/11 checks passed against the bundled GLP-1 cardiovascular outcomes meta-analysis benchmark.",
          "tier": "exact",
          "verdict": "PASS"
        },
        "report_summary": {
          "k": 10,
          "total_n": 73263,
          "checks_passed": 11,
          "checks_total": 11,
          "all_passed": true,
          "verdict": "PASS"
        }
      }
    },
    "glp1_cvot_allcause": {
      "category": "Cardiovascular Outcomes",
      "extraction": {
        "ctgov": {
          "has2x2": false,
          "hasReportedEffect": false,
          "hasResults": true,
          "matchScore": 15,
          "matchedOutcome": "Time to First Occurrence of Major Adverse Cardiovascular Events (MACE): Event Rate Per 100 Participant-years for First Occurrence of Major Cardiovascular (CV) Event - Non-Inferiority Analysis",
          "recordExtract": "Time to First Occurrence of Major Adverse Cardiovascular Events (MACE): Event Rate Per 100 Participant-years for First Occurrence of Major Cardiovascular (CV) Event - Non-Inferiority Analysis | Tx --/-- vs Ctrl --/--",
          "sampleNctId": "NCT03496298",
          "success": false
        },
        "pubmed": {
          "effectCount": 1,
          "firstExtract": "HR 1.14 [95% CI, 0.89-1.46]",
          "pmid": "41711744",
          "success": true,
          "title": "Semaglutide vs tirzepatide in patients with obesity and HFpEF: a report from a global federated research network."
        }
      },
      "failReasons": [
        "ctgov_extract"
      ],
      "name": "GLP-1 receptor agonists - CVOT - All-cause mortality",
      "policy": {
        "allowedSources": [
          "ctgov",
          "pubmed",
          "openalex"
        ],
        "extractionMode": "pubmed-abstract-and-ctgov-records-only",
        "pass": true,
        "pdfUploadHidden": true,
        "pdfViewerHidden": true,
        "yearFloor": 2015
      },
      "screening": {
        "humanCheckable": true,
        "recordsWithAnchors": 1
      },
      "search": {
        "ctgov": {
          "anchorRecall": 0.125,
          "count": 16,
          "eligible": 8,
          "firstResult": {
            "nctId": "NCT05819138",
            "title": "Type 1 Diabetes Impacts of Semaglutide on Cardiovascular Outcomes",
            "year": "2023"
          },
          "matched": [
            "NCT02465515"
          ],
          "statusText": "CT.gov: kept 16 trials after applying the 2015+ floor"
        },
        "openalex": {
          "anchorRecall": 0.625,
          "count": 20,
          "eligible": 8,
          "firstResult": {
            "doi": "10.23736/s2724-6507.20.03219-8",
            "title": "Pancreatitis and pancreatic cancer in patients with type 2 diabetes treated with glucagon-like peptide-1 receptor agonists: an updated meta-analysis of randomized controlled trials",
            "year": "2023"
          },
          "matched": [
            "NCT01179048",
            "NCT01720446",
            "NCT01144338",
            "NCT01394952",
            "NCT03496298"
          ],
          "statusText": "OpenAlex: kept 20 records after applying the 2015+ floor"
        },
        "pubmed": {
          "anchorRecall": 0.25,
          "count": 20,
          "eligible": 8,
          "firstResult": {
            "doi": "10.59556/japi.74.1375",
            "pmid": "41818087",
            "title": "National Consensus on Semaglutide in Cardiology: From Clinical Evidence to Clinical Translation.",
            "year": "2026"
          },
          "matched": [
            "NCT01720446",
            "NCT02692716"
          ],
          "statusText": "1317 total results (PubMed: 20)"
        }
      },
      "status": "warn",
      "topicId": "glp1_cvot_allcause",
      "validationPackId": "glp1_cvot_exact",
      "id": "glp1_cvot_allcause",
      "pack": {
        "id": "glp1_cvot_exact",
        "meta": {
          "counts": {
            "checksPassed": 11,
            "checksTotal": 11,
            "k": 10,
            "totalN": 73263
          },
          "date": "2026-02-27",
          "id": "glp1_cvot_exact",
          "name": "GLP-1 CVOT Exact Replication",
          "reference": {
            "doi": "10.1111/dom.70121",
            "journal": "Diabetes, Obesity & Metabolism",
            "pmid": "40926380",
            "title": "Cardiovascular risk reduction with GLP-1 receptor agonists is proportional to HbA1c lowering in type 2 diabetes",
            "year": 2025
          },
          "sourcePath": "validation/reports/exact_replication_glp1/exact_replication_glp1_report.json",
          "summary": "11/11 checks passed against the bundled GLP-1 cardiovascular outcomes meta-analysis benchmark.",
          "tier": "exact",
          "verdict": "PASS"
        },
        "report_summary": {
          "k": 10,
          "total_n": 73263,
          "checks_passed": 11,
          "checks_total": 11,
          "all_passed": true,
          "verdict": "PASS"
        }
      }
    },
    "glp1_cvot_hfh": {
      "category": "Cardiovascular Outcomes",
      "extraction": {
        "ctgov": {
          "has2x2": false,
          "hasReportedEffect": false,
          "hasResults": true,
          "matchScore": 33,
          "matchedOutcome": "Time to First Occurrence of Major Adverse Cardiovascular Events (MACE): Event Rate Per 100 Participant-years for First Occurrence of Major Cardiovascular (CV) Event - Non-Inferiority Analysis",
          "recordExtract": "Time to First Occurrence of Major Adverse Cardiovascular Events (MACE): Event Rate Per 100 Participant-years for First Occurrence of Major Cardiovascular (CV) Event - Non-Inferiority Analysis | Tx --/-- vs Ctrl --/--",
          "sampleNctId": "NCT03496298",
          "success": false
        },
        "pubmed": {
          "effectCount": 1,
          "firstExtract": "HR 1.14 [95% CI, 0.89-1.46]",
          "pmid": "41711744",
          "success": true,
          "title": "Semaglutide vs tirzepatide in patients with obesity and HFpEF: a report from a global federated research network."
        }
      },
      "failReasons": [
        "ctgov_extract"
      ],
      "name": "GLP-1 receptor agonists - CVOT - HF hospitalization",
      "policy": {
        "allowedSources": [
          "ctgov",
          "pubmed",
          "openalex"
        ],
        "extractionMode": "pubmed-abstract-and-ctgov-records-only",
        "pass": true,
        "pdfUploadHidden": true,
        "pdfViewerHidden": true,
        "yearFloor": 2015
      },
      "screening": {
        "humanCheckable": true,
        "recordsWithAnchors": 1
      },
      "search": {
        "ctgov": {
          "anchorRecall": 0.125,
          "count": 16,
          "eligible": 8,
          "firstResult": {
            "nctId": "NCT05819138",
            "title": "Type 1 Diabetes Impacts of Semaglutide on Cardiovascular Outcomes",
            "year": "2023"
          },
          "matched": [
            "NCT02465515"
          ],
          "statusText": "CT.gov: kept 16 trials after applying the 2015+ floor"
        },
        "openalex": {
          "anchorRecall": 0.625,
          "count": 20,
          "eligible": 8,
          "firstResult": {
            "doi": "10.23736/s2724-6507.20.03219-8",
            "title": "Pancreatitis and pancreatic cancer in patients with type 2 diabetes treated with glucagon-like peptide-1 receptor agonists: an updated meta-analysis of randomized controlled trials",
            "year": "2023"
          },
          "matched": [
            "NCT01179048",
            "NCT01720446",
            "NCT01144338",
            "NCT01394952",
            "NCT03496298"
          ],
          "statusText": "OpenAlex: kept 20 records after applying the 2015+ floor"
        },
        "pubmed": {
          "anchorRecall": 0.25,
          "count": 20,
          "eligible": 8,
          "firstResult": {
            "doi": "10.59556/japi.74.1375",
            "pmid": "41818087",
            "title": "National Consensus on Semaglutide in Cardiology: From Clinical Evidence to Clinical Translation.",
            "year": "2026"
          },
          "matched": [
            "NCT01720446",
            "NCT02692716"
          ],
          "statusText": "1373 total results (PubMed: 20)"
        }
      },
      "status": "warn",
      "topicId": "glp1_cvot_hfh",
      "validationPackId": "glp1_cvot_exact",
      "id": "glp1_cvot_hfh",
      "pack": {
        "id": "glp1_cvot_exact",
        "meta": {
          "counts": {
            "checksPassed": 11,
            "checksTotal": 11,
            "k": 10,
            "totalN": 73263
          },
          "date": "2026-02-27",
          "id": "glp1_cvot_exact",
          "name": "GLP-1 CVOT Exact Replication",
          "reference": {
            "doi": "10.1111/dom.70121",
            "journal": "Diabetes, Obesity & Metabolism",
            "pmid": "40926380",
            "title": "Cardiovascular risk reduction with GLP-1 receptor agonists is proportional to HbA1c lowering in type 2 diabetes",
            "year": 2025
          },
          "sourcePath": "validation/reports/exact_replication_glp1/exact_replication_glp1_report.json",
          "summary": "11/11 checks passed against the bundled GLP-1 cardiovascular outcomes meta-analysis benchmark.",
          "tier": "exact",
          "verdict": "PASS"
        },
        "report_summary": {
          "k": 10,
          "total_n": 73263,
          "checks_passed": 11,
          "checks_total": 11,
          "all_passed": true,
          "verdict": "PASS"
        }
      }
    },
    "glp1_cvot_oral": {
      "category": "Cardiovascular Outcomes",
      "extraction": {
        "ctgov": {
          "has2x2": false,
          "hasReportedEffect": false,
          "hasResults": true,
          "matchScore": 63,
          "matchedOutcome": "Time to First Occurrence of Major Adverse Cardiovascular Events (MACE): Event Rate Per 100 Participant-years for First Occurrence of Major Cardiovascular (CV) Event - Non-Inferiority Analysis",
          "recordExtract": "Time to First Occurrence of Major Adverse Cardiovascular Events (MACE): Event Rate Per 100 Participant-years for First Occurrence of Major Cardiovascular (CV) Event - Non-Inferiority Analysis | Tx --/-- vs Ctrl --/--",
          "sampleNctId": "NCT03496298",
          "success": false
        },
        "pubmed": {
          "effectCount": 1,
          "firstExtract": "HR 1.14 [95% CI, 0.89-1.46]",
          "pmid": "41711744",
          "success": true,
          "title": "Semaglutide vs tirzepatide in patients with obesity and HFpEF: a report from a global federated research network."
        }
      },
      "failReasons": [
        "ctgov_extract"
      ],
      "name": "GLP-1 receptor agonists - CVOT - Oral semaglutide safety",
      "policy": {
        "allowedSources": [
          "ctgov",
          "pubmed",
          "openalex"
        ],
        "extractionMode": "pubmed-abstract-and-ctgov-records-only",
        "pass": true,
        "pdfUploadHidden": true,
        "pdfViewerHidden": true,
        "yearFloor": 2015
      },
      "screening": {
        "humanCheckable": true,
        "recordsWithAnchors": 1
      },
      "search": {
        "ctgov": {
          "anchorRecall": 0.125,
          "count": 16,
          "eligible": 8,
          "firstResult": {
            "nctId": "NCT05819138",
            "title": "Type 1 Diabetes Impacts of Semaglutide on Cardiovascular Outcomes",
            "year": "2023"
          },
          "matched": [
            "NCT02465515"
          ],
          "statusText": "CT.gov: kept 16 trials after applying the 2015+ floor"
        },
        "openalex": {
          "anchorRecall": 0.625,
          "count": 20,
          "eligible": 8,
          "firstResult": {
            "doi": "10.23736/s2724-6507.20.03219-8",
            "title": "Pancreatitis and pancreatic cancer in patients with type 2 diabetes treated with glucagon-like peptide-1 receptor agonists: an updated meta-analysis of randomized controlled trials",
            "year": "2023"
          },
          "matched": [
            "NCT01179048",
            "NCT01720446",
            "NCT01144338",
            "NCT01394952",
            "NCT03496298"
          ],
          "statusText": "OpenAlex: kept 20 records after applying the 2015+ floor"
        },
        "pubmed": {
          "anchorRecall": 0.25,
          "count": 20,
          "eligible": 8,
          "firstResult": {
            "doi": "10.59556/japi.74.1375",
            "pmid": "41818087",
            "title": "National Consensus on Semaglutide in Cardiology: From Clinical Evidence to Clinical Translation.",
            "year": "2026"
          },
          "matched": [
            "NCT01720446",
            "NCT02692716"
          ],
          "statusText": "1429 total results (PubMed: 20)"
        }
      },
      "status": "warn",
      "topicId": "glp1_cvot_oral",
      "validationPackId": "glp1_cvot_exact",
      "id": "glp1_cvot_oral",
      "pack": {
        "id": "glp1_cvot_exact",
        "meta": {
          "counts": {
            "checksPassed": 11,
            "checksTotal": 11,
            "k": 10,
            "totalN": 73263
          },
          "date": "2026-02-27",
          "id": "glp1_cvot_exact",
          "name": "GLP-1 CVOT Exact Replication",
          "reference": {
            "doi": "10.1111/dom.70121",
            "journal": "Diabetes, Obesity & Metabolism",
            "pmid": "40926380",
            "title": "Cardiovascular risk reduction with GLP-1 receptor agonists is proportional to HbA1c lowering in type 2 diabetes",
            "year": 2025
          },
          "sourcePath": "validation/reports/exact_replication_glp1/exact_replication_glp1_report.json",
          "summary": "11/11 checks passed against the bundled GLP-1 cardiovascular outcomes meta-analysis benchmark.",
          "tier": "exact",
          "verdict": "PASS"
        },
        "report_summary": {
          "k": 10,
          "total_n": 73263,
          "checks_passed": 11,
          "checks_total": 11,
          "all_passed": true,
          "verdict": "PASS"
        }
      }
    },
    "colchicine_cvd_mace": {
      "category": "Atherosclerosis and Inflammation",
      "extraction": {
        "ctgov": {
          "has2x2": false,
          "hasReportedEffect": false,
          "hasResults": false,
          "matchScore": 45,
          "matchedOutcome": "First Event of Cardiovascular Death, Resuscitated Cardiac Arrest, Acute Myocardial Infarction, Stroke, or Urgent Hospitalization for Angina Requiring Coronary Revascularization",
          "recordExtract": "First Event of Cardiovascular Death, Resuscitated Cardiac Arrest, Acute Myocardial Infarction, Stroke, or Urgent Hospitalization for Angina Requiring Coronary Revascularization | Tx --/-- vs Ctrl --/--",
          "sampleNctId": "NCT02898610",
          "success": false
        },
        "pubmed": {
          "effectCount": 1,
          "firstExtract": "RR, 0.83 [95% CI, 0.66-1.04]",
          "pmid": "41568554",
          "success": true,
          "title": "Colchicine in Patients With Recent Myocardial Infarction: A Systematic Review and Meta-Analysis of Randomized Controlled Trials."
        }
      },
      "failReasons": [
        "ctgov_extract"
      ],
      "name": "Colchicine - Cardiovascular prevention - MACE",
      "policy": {
        "allowedSources": [
          "ctgov",
          "pubmed",
          "openalex"
        ],
        "extractionMode": "pubmed-abstract-and-ctgov-records-only",
        "pass": true,
        "pdfUploadHidden": true,
        "pdfViewerHidden": true,
        "yearFloor": 2015
      },
      "screening": {
        "humanCheckable": true,
        "recordsWithAnchors": 1
      },
      "search": {
        "ctgov": {
          "anchorRecall": 0.3333333333333333,
          "count": 18,
          "eligible": 3,
          "firstResult": {
            "nctId": "NCT05250596",
            "title": "On-admission Low-dose Colchicine in Addition to Atorvastatin to Reduce Inflammation in Acute Coronary Syndrome",
            "year": "2022"
          },
          "matched": [
            "NCT02551094"
          ],
          "statusText": "CT.gov: kept 18 trials after applying the 2015+ floor"
        },
        "openalex": {
          "anchorRecall": 1,
          "count": 20,
          "eligible": 5,
          "firstResult": {
            "doi": "10.1155/2024/8646351",
            "nctId": "NCT03048825",
            "pmid": "38505729",
            "title": "Meta-Analysis of Randomized Trials: Efficacy and Safety of Colchicine for Secondary Prevention of Cardiovascular Disease",
            "year": "2024"
          },
          "matched": [
            "NCT02551094",
            "LODOCO2",
            "COPS",
            "NCT03048825",
            "NCT02898610"
          ],
          "statusText": "OpenAlex: kept 20 records after applying the 2015+ floor"
        },
        "pubmed": {
          "anchorRecall": 0.4,
          "count": 20,
          "eligible": 5,
          "firstResult": {
            "doi": "10.1002/bcp.70523",
            "pmid": "41830179",
            "title": "Efficacy of low-dose colchicine on left ventricular hypertrophy in patients with coronary artery disease: A randomized controlled trial.",
            "year": "2026"
          },
          "matched": [
            "NCT02551094",
            "LODOCO2"
          ],
          "statusText": "1487 total results (PubMed: 20)"
        }
      },
      "status": "warn",
      "topicId": "colchicine_cvd_mace",
      "validationPackId": "colchicine_cvd_exact",
      "id": "colchicine_cvd_mace",
      "pack": {
        "id": "colchicine_cvd_exact",
        "meta": {
          "counts": {
            "checksPassed": 8,
            "checksTotal": 8,
            "k": 6,
            "totalN": 21800
          },
          "date": "2026-02-27",
          "id": "colchicine_cvd_exact",
          "name": "Colchicine CVD Exact Replication",
          "reference": {
            "doi": "10.1093/eurheartj/ehaf174",
            "journal": "European Heart Journal",
            "pmid": "40314333",
            "title": "Long-term trials of colchicine for secondary prevention of vascular events: a meta-analysis",
            "year": 2025
          },
          "sourcePath": "validation/reports/exact_replication_colchicine/exact_replication_colchicine_report.json",
          "summary": "8/8 checks passed against the bundled colchicine vascular events meta-analysis benchmark.",
          "tier": "exact",
          "verdict": "PASS"
        },
        "report_summary": {
          "k": 6,
          "total_n": 21800,
          "checks_passed": 8,
          "checks_total": 8,
          "all_passed": true,
          "verdict": "PASS"
        }
      }
    },
    "colchicine_cvd_postmi": {
      "category": "Atherosclerosis and Inflammation",
      "extraction": {
        "ctgov": {
          "has2x2": false,
          "hasReportedEffect": false,
          "hasResults": false,
          "matchScore": 57,
          "matchedOutcome": "First Event of Cardiovascular Death, Resuscitated Cardiac Arrest, Acute Myocardial Infarction, Stroke, or Urgent Hospitalization for Angina Requiring Coronary Revascularization",
          "recordExtract": "First Event of Cardiovascular Death, Resuscitated Cardiac Arrest, Acute Myocardial Infarction, Stroke, or Urgent Hospitalization for Angina Requiring Coronary Revascularization | Tx --/-- vs Ctrl --/--",
          "sampleNctId": "NCT02898610",
          "success": false
        },
        "pubmed": {
          "effectCount": 1,
          "firstExtract": "RR, 0.83 [95% CI, 0.66-1.04]",
          "pmid": "41568554",
          "success": true,
          "title": "Colchicine in Patients With Recent Myocardial Infarction: A Systematic Review and Meta-Analysis of Randomized Controlled Trials."
        }
      },
      "failReasons": [
        "ctgov_extract"
      ],
      "name": "Colchicine - Cardiovascular prevention - Recent MI",
      "policy": {
        "allowedSources": [
          "ctgov",
          "pubmed",
          "openalex"
        ],
        "extractionMode": "pubmed-abstract-and-ctgov-records-only",
        "pass": true,
        "pdfUploadHidden": true,
        "pdfViewerHidden": true,
        "yearFloor": 2015
      },
      "screening": {
        "humanCheckable": true,
        "recordsWithAnchors": 1
      },
      "search": {
        "ctgov": {
          "anchorRecall": 0.3333333333333333,
          "count": 18,
          "eligible": 3,
          "firstResult": {
            "nctId": "NCT05250596",
            "title": "On-admission Low-dose Colchicine in Addition to Atorvastatin to Reduce Inflammation in Acute Coronary Syndrome",
            "year": "2022"
          },
          "matched": [
            "NCT02551094"
          ],
          "statusText": "CT.gov: kept 18 trials after applying the 2015+ floor"
        },
        "openalex": {
          "anchorRecall": 1,
          "count": 20,
          "eligible": 5,
          "firstResult": {
            "doi": "10.1155/2024/8646351",
            "nctId": "NCT03048825",
            "pmid": "38505729",
            "title": "Meta-Analysis of Randomized Trials: Efficacy and Safety of Colchicine for Secondary Prevention of Cardiovascular Disease",
            "year": "2024"
          },
          "matched": [
            "NCT02551094",
            "LODOCO2",
            "COPS",
            "NCT03048825",
            "NCT02898610"
          ],
          "statusText": "OpenAlex: kept 20 records after applying the 2015+ floor"
        },
        "pubmed": {
          "anchorRecall": 0.4,
          "count": 20,
          "eligible": 5,
          "firstResult": {
            "doi": "10.1002/bcp.70523",
            "pmid": "41830179",
            "title": "Efficacy of low-dose colchicine on left ventricular hypertrophy in patients with coronary artery disease: A randomized controlled trial.",
            "year": "2026"
          },
          "matched": [
            "NCT02551094",
            "LODOCO2"
          ],
          "statusText": "1545 total results (PubMed: 20)"
        }
      },
      "status": "warn",
      "topicId": "colchicine_cvd_postmi",
      "validationPackId": "colchicine_cvd_exact",
      "id": "colchicine_cvd_postmi",
      "pack": {
        "id": "colchicine_cvd_exact",
        "meta": {
          "counts": {
            "checksPassed": 8,
            "checksTotal": 8,
            "k": 6,
            "totalN": 21800
          },
          "date": "2026-02-27",
          "id": "colchicine_cvd_exact",
          "name": "Colchicine CVD Exact Replication",
          "reference": {
            "doi": "10.1093/eurheartj/ehaf174",
            "journal": "European Heart Journal",
            "pmid": "40314333",
            "title": "Long-term trials of colchicine for secondary prevention of vascular events: a meta-analysis",
            "year": 2025
          },
          "sourcePath": "validation/reports/exact_replication_colchicine/exact_replication_colchicine_report.json",
          "summary": "8/8 checks passed against the bundled colchicine vascular events meta-analysis benchmark.",
          "tier": "exact",
          "verdict": "PASS"
        },
        "report_summary": {
          "k": 6,
          "total_n": 21800,
          "checks_passed": 8,
          "checks_total": 8,
          "all_passed": true,
          "verdict": "PASS"
        }
      }
    },
    "colchicine_cvd_cad": {
      "category": "Atherosclerosis and Inflammation",
      "extraction": {
        "ctgov": {
          "has2x2": false,
          "hasReportedEffect": false,
          "hasResults": false,
          "matchScore": 27,
          "matchedOutcome": "First Event of Cardiovascular Death, Resuscitated Cardiac Arrest, Acute Myocardial Infarction, Stroke, or Urgent Hospitalization for Angina Requiring Coronary Revascularization",
          "recordExtract": "First Event of Cardiovascular Death, Resuscitated Cardiac Arrest, Acute Myocardial Infarction, Stroke, or Urgent Hospitalization for Angina Requiring Coronary Revascularization | Tx --/-- vs Ctrl --/--",
          "sampleNctId": "NCT02898610",
          "success": false
        },
        "pubmed": {
          "effectCount": 1,
          "firstExtract": "RR, 0.83 [95% CI, 0.66-1.04]",
          "pmid": "41568554",
          "success": true,
          "title": "Colchicine in Patients With Recent Myocardial Infarction: A Systematic Review and Meta-Analysis of Randomized Controlled Trials."
        }
      },
      "failReasons": [
        "ctgov_extract"
      ],
      "name": "Colchicine - Cardiovascular prevention - Chronic CAD",
      "policy": {
        "allowedSources": [
          "ctgov",
          "pubmed",
          "openalex"
        ],
        "extractionMode": "pubmed-abstract-and-ctgov-records-only",
        "pass": true,
        "pdfUploadHidden": true,
        "pdfViewerHidden": true,
        "yearFloor": 2015
      },
      "screening": {
        "humanCheckable": true,
        "recordsWithAnchors": 1
      },
      "search": {
        "ctgov": {
          "anchorRecall": 0.3333333333333333,
          "count": 18,
          "eligible": 3,
          "firstResult": {
            "nctId": "NCT05250596",
            "title": "On-admission Low-dose Colchicine in Addition to Atorvastatin to Reduce Inflammation in Acute Coronary Syndrome",
            "year": "2022"
          },
          "matched": [
            "NCT02551094"
          ],
          "statusText": "CT.gov: kept 18 trials after applying the 2015+ floor"
        },
        "openalex": {
          "anchorRecall": 1,
          "count": 20,
          "eligible": 5,
          "firstResult": {
            "doi": "10.1155/2024/8646351",
            "nctId": "NCT03048825",
            "pmid": "38505729",
            "title": "Meta-Analysis of Randomized Trials: Efficacy and Safety of Colchicine for Secondary Prevention of Cardiovascular Disease",
            "year": "2024"
          },
          "matched": [
            "NCT02551094",
            "LODOCO2",
            "COPS",
            "NCT03048825",
            "NCT02898610"
          ],
          "statusText": "OpenAlex: kept 20 records after applying the 2015+ floor"
        },
        "pubmed": {
          "anchorRecall": 0.4,
          "count": 20,
          "eligible": 5,
          "firstResult": {
            "doi": "10.1002/bcp.70523",
            "pmid": "41830179",
            "title": "Efficacy of low-dose colchicine on left ventricular hypertrophy in patients with coronary artery disease: A randomized controlled trial.",
            "year": "2026"
          },
          "matched": [
            "NCT02551094",
            "LODOCO2"
          ],
          "statusText": "1603 total results (PubMed: 20)"
        }
      },
      "status": "warn",
      "topicId": "colchicine_cvd_cad",
      "validationPackId": "colchicine_cvd_exact",
      "id": "colchicine_cvd_cad",
      "pack": {
        "id": "colchicine_cvd_exact",
        "meta": {
          "counts": {
            "checksPassed": 8,
            "checksTotal": 8,
            "k": 6,
            "totalN": 21800
          },
          "date": "2026-02-27",
          "id": "colchicine_cvd_exact",
          "name": "Colchicine CVD Exact Replication",
          "reference": {
            "doi": "10.1093/eurheartj/ehaf174",
            "journal": "European Heart Journal",
            "pmid": "40314333",
            "title": "Long-term trials of colchicine for secondary prevention of vascular events: a meta-analysis",
            "year": 2025
          },
          "sourcePath": "validation/reports/exact_replication_colchicine/exact_replication_colchicine_report.json",
          "summary": "8/8 checks passed against the bundled colchicine vascular events meta-analysis benchmark.",
          "tier": "exact",
          "verdict": "PASS"
        },
        "report_summary": {
          "k": 6,
          "total_n": 21800,
          "checks_passed": 8,
          "checks_total": 8,
          "all_passed": true,
          "verdict": "PASS"
        }
      }
    },
    "colchicine_cvd_stroke": {
      "category": "Atherosclerosis and Inflammation",
      "extraction": {
        "ctgov": {
          "has2x2": false,
          "hasReportedEffect": false,
          "hasResults": false,
          "matchScore": 45,
          "matchedOutcome": "First Event of Cardiovascular Death, Resuscitated Cardiac Arrest, Acute Myocardial Infarction, Stroke, or Urgent Hospitalization for Angina Requiring Coronary Revascularization",
          "recordExtract": "First Event of Cardiovascular Death, Resuscitated Cardiac Arrest, Acute Myocardial Infarction, Stroke, or Urgent Hospitalization for Angina Requiring Coronary Revascularization | Tx --/-- vs Ctrl --/--",
          "sampleNctId": "NCT02898610",
          "success": false
        },
        "pubmed": {
          "effectCount": 1,
          "firstExtract": "RR, 0.83 [95% CI, 0.66-1.04]",
          "pmid": "41568554",
          "success": true,
          "title": "Colchicine in Patients With Recent Myocardial Infarction: A Systematic Review and Meta-Analysis of Randomized Controlled Trials."
        }
      },
      "failReasons": [
        "ctgov_extract"
      ],
      "name": "Colchicine - Cardiovascular prevention - Stroke/TIA",
      "policy": {
        "allowedSources": [
          "ctgov",
          "pubmed",
          "openalex"
        ],
        "extractionMode": "pubmed-abstract-and-ctgov-records-only",
        "pass": true,
        "pdfUploadHidden": true,
        "pdfViewerHidden": true,
        "yearFloor": 2015
      },
      "screening": {
        "humanCheckable": true,
        "recordsWithAnchors": 1
      },
      "search": {
        "ctgov": {
          "anchorRecall": 0.3333333333333333,
          "count": 18,
          "eligible": 3,
          "firstResult": {
            "nctId": "NCT05250596",
            "title": "On-admission Low-dose Colchicine in Addition to Atorvastatin to Reduce Inflammation in Acute Coronary Syndrome",
            "year": "2022"
          },
          "matched": [
            "NCT02551094"
          ],
          "statusText": "CT.gov: kept 18 trials after applying the 2015+ floor"
        },
        "openalex": {
          "anchorRecall": 1,
          "count": 20,
          "eligible": 5,
          "firstResult": {
            "doi": "10.1155/2024/8646351",
            "nctId": "NCT03048825",
            "pmid": "38505729",
            "title": "Meta-Analysis of Randomized Trials: Efficacy and Safety of Colchicine for Secondary Prevention of Cardiovascular Disease",
            "year": "2024"
          },
          "matched": [
            "NCT02551094",
            "LODOCO2",
            "COPS",
            "NCT03048825",
            "NCT02898610"
          ],
          "statusText": "OpenAlex: kept 20 records after applying the 2015+ floor"
        },
        "pubmed": {
          "anchorRecall": 0.4,
          "count": 20,
          "eligible": 5,
          "firstResult": {
            "doi": "10.1002/bcp.70523",
            "pmid": "41830179",
            "title": "Efficacy of low-dose colchicine on left ventricular hypertrophy in patients with coronary artery disease: A randomized controlled trial.",
            "year": "2026"
          },
          "matched": [
            "NCT02551094",
            "LODOCO2"
          ],
          "statusText": "1661 total results (PubMed: 20)"
        }
      },
      "status": "warn",
      "topicId": "colchicine_cvd_stroke",
      "validationPackId": "colchicine_cvd_exact",
      "id": "colchicine_cvd_stroke",
      "pack": {
        "id": "colchicine_cvd_exact",
        "meta": {
          "counts": {
            "checksPassed": 8,
            "checksTotal": 8,
            "k": 6,
            "totalN": 21800
          },
          "date": "2026-02-27",
          "id": "colchicine_cvd_exact",
          "name": "Colchicine CVD Exact Replication",
          "reference": {
            "doi": "10.1093/eurheartj/ehaf174",
            "journal": "European Heart Journal",
            "pmid": "40314333",
            "title": "Long-term trials of colchicine for secondary prevention of vascular events: a meta-analysis",
            "year": 2025
          },
          "sourcePath": "validation/reports/exact_replication_colchicine/exact_replication_colchicine_report.json",
          "summary": "8/8 checks passed against the bundled colchicine vascular events meta-analysis benchmark.",
          "tier": "exact",
          "verdict": "PASS"
        },
        "report_summary": {
          "k": 6,
          "total_n": 21800,
          "checks_passed": 8,
          "checks_total": 8,
          "all_passed": true,
          "verdict": "PASS"
        }
      }
    },
    "pcsk9_mace": {
      "category": "Lipids",
      "extraction": {
        "ctgov": {
          "has2x2": false,
          "hasReportedEffect": false,
          "hasResults": true,
          "matchScore": 15,
          "matchedOutcome": "Percentage Change in LDL-C From Baseline to Day 510",
          "recordExtract": "Percentage Change in LDL-C From Baseline to Day 510 | Tx --/-- vs Ctrl --/--",
          "sampleNctId": "NCT03400800",
          "success": false
        },
        "pubmed": {
          "effectCount": 2,
          "firstExtract": "HR: 1.11; 95% CI: 1.02-1.21",
          "pmid": "41369622",
          "success": true,
          "title": "Obesity-Associated Cardiovascular Risk and Benefit From PCSK9 Inhibition: A Prespecified Analysis From FOURIER."
        }
      },
      "failReasons": [
        "ctgov_anchor_recall",
        "ctgov_extract"
      ],
      "name": "PCSK9 pathway inhibitors - MACE",
      "policy": {
        "allowedSources": [
          "ctgov",
          "pubmed",
          "openalex"
        ],
        "extractionMode": "pubmed-abstract-and-ctgov-records-only",
        "pass": true,
        "pdfUploadHidden": true,
        "pdfViewerHidden": true,
        "yearFloor": 2015
      },
      "screening": {
        "humanCheckable": true,
        "recordsWithAnchors": 0
      },
      "search": {
        "ctgov": {
          "anchorRecall": 0,
          "count": 17,
          "eligible": 4,
          "firstResult": {
            "nctId": "NCT05639218",
            "title": "Impact of Optimal Pharmacotherapy on Plasma Lipid Profile and Qualitative Features of Atherosclerotic Plaques in Very-high Cardiovascular Risk Patients With Established Atherosclerotic Cardiovascular Disease",
            "year": "2021"
          },
          "matched": [],
          "statusText": "CT.gov: kept 17 trials after applying the 2015+ floor"
        },
        "openalex": {
          "anchorRecall": 0.5,
          "count": 20,
          "eligible": 4,
          "firstResult": {
            "doi": "10.1056/nejmoa1500858",
            "nctId": "NCT01439880",
            "title": "Efficacy and Safety of Evolocumab in Reducing Lipids and Cardiovascular Events",
            "year": "2015"
          },
          "matched": [
            "NCT01764633",
            "NCT01663402"
          ],
          "statusText": "OpenAlex: kept 20 records after applying the 2015+ floor"
        },
        "pubmed": {
          "anchorRecall": 1,
          "count": 20,
          "eligible": 4,
          "firstResult": {
            "doi": "10.1016/j.atherosclerosis.2026.120686",
            "pmid": "41806515",
            "title": "LDL subspecies and lipidome change by evolocumab add-on therapy to empagliflozin in patients with type 2 diabetes: A prespecified secondary analysis of a randomized clinical trial.",
            "year": "2026"
          },
          "matched": [
            "NCT01764633",
            "NCT01663402",
            "NCT03399370",
            "NCT03400800"
          ],
          "statusText": "1718 total results (PubMed: 20)"
        }
      },
      "status": "warn",
      "topicId": "pcsk9_mace",
      "validationPackId": "pairwise70_cardio",
      "id": "pcsk9_mace",
      "pack": {
        "id": "pairwise70_cardio",
        "meta": {
          "counts": {
            "error": 0,
            "fail": 0,
            "pass": 45,
            "passRate": 100,
            "prepared": 45
          },
          "date": "2026-02-27",
          "id": "pairwise70_cardio",
          "name": "Pairwise70 Cardio End-to-End",
          "sourcePath": "validation/reports/pairwise70_cardio_benchmark/pairwise70_cardio_end_to_end_report.json",
          "summary": "45/45 prepared cardiovascular datasets passed using ClinicalTrials.gov, PubMed, and OpenAlex only, with no PDF extraction pipeline.",
          "tier": "domain",
          "verdict": "PASS"
        },
        "report_summary": {
          "scope": {
            "domain": "cardiovascular",
            "design": "RCT-focused Pairwise70 Cochrane study-level",
            "sources": [
              "ClinicalTrials.gov",
              "AACT",
              "PubMed",
              "OpenAlex"
            ],
            "pdf_pipeline_used": false
          },
          "counts": {
            "cardio_review_ids": 52,
            "cardio_dataset_files": 47,
            "prepared_datasets": 45,
            "skipped_datasets": 2,
            "pass": 45,
            "fail": 0,
            "error": 0,
            "pass_rate": 100.0
          },
          "elapsed_seconds": 9.37
        }
      }
    },
    "pcsk9_acs": {
      "category": "Lipids",
      "extraction": {
        "ctgov": {
          "has2x2": false,
          "hasReportedEffect": false,
          "hasResults": true,
          "matchScore": 27,
          "matchedOutcome": "Time-adjusted Percent Change in LDL-C Levels From Baseline After Day 90 and up to Day 540",
          "recordExtract": "Time-adjusted Percent Change in LDL-C Levels From Baseline After Day 90 and up to Day 540 | Tx --/-- vs Ctrl --/--",
          "sampleNctId": "NCT03400800",
          "success": false
        },
        "pubmed": {
          "effectCount": 2,
          "firstExtract": "HR: 1.11; 95% CI: 1.02-1.21",
          "pmid": "41369622",
          "success": true,
          "title": "Obesity-Associated Cardiovascular Risk and Benefit From PCSK9 Inhibition: A Prespecified Analysis From FOURIER."
        }
      },
      "failReasons": [
        "ctgov_anchor_recall",
        "ctgov_extract"
      ],
      "name": "PCSK9 pathway inhibitors - ACS subgroup",
      "policy": {
        "allowedSources": [
          "ctgov",
          "pubmed",
          "openalex"
        ],
        "extractionMode": "pubmed-abstract-and-ctgov-records-only",
        "pass": true,
        "pdfUploadHidden": true,
        "pdfViewerHidden": true,
        "yearFloor": 2015
      },
      "screening": {
        "humanCheckable": true,
        "recordsWithAnchors": 0
      },
      "search": {
        "ctgov": {
          "anchorRecall": 0,
          "count": 17,
          "eligible": 4,
          "firstResult": {
            "nctId": "NCT05639218",
            "title": "Impact of Optimal Pharmacotherapy on Plasma Lipid Profile and Qualitative Features of Atherosclerotic Plaques in Very-high Cardiovascular Risk Patients With Established Atherosclerotic Cardiovascular Disease",
            "year": "2021"
          },
          "matched": [],
          "statusText": "CT.gov: kept 17 trials after applying the 2015+ floor"
        },
        "openalex": {
          "anchorRecall": 0.5,
          "count": 20,
          "eligible": 4,
          "firstResult": {
            "doi": "10.1056/nejmoa1500858",
            "nctId": "NCT01439880",
            "title": "Efficacy and Safety of Evolocumab in Reducing Lipids and Cardiovascular Events",
            "year": "2015"
          },
          "matched": [
            "NCT01764633",
            "NCT01663402"
          ],
          "statusText": "OpenAlex: kept 20 records after applying the 2015+ floor"
        },
        "pubmed": {
          "anchorRecall": 1,
          "count": 20,
          "eligible": 4,
          "firstResult": {
            "doi": "10.1016/j.atherosclerosis.2026.120686",
            "pmid": "41806515",
            "title": "LDL subspecies and lipidome change by evolocumab add-on therapy to empagliflozin in patients with type 2 diabetes: A prespecified secondary analysis of a randomized clinical trial.",
            "year": "2026"
          },
          "matched": [
            "NCT01764633",
            "NCT01663402",
            "NCT03399370",
            "NCT03400800"
          ],
          "statusText": "1775 total results (PubMed: 20)"
        }
      },
      "status": "warn",
      "topicId": "pcsk9_acs",
      "validationPackId": "pairwise70_cardio",
      "id": "pcsk9_acs",
      "pack": {
        "id": "pairwise70_cardio",
        "meta": {
          "counts": {
            "error": 0,
            "fail": 0,
            "pass": 45,
            "passRate": 100,
            "prepared": 45
          },
          "date": "2026-02-27",
          "id": "pairwise70_cardio",
          "name": "Pairwise70 Cardio End-to-End",
          "sourcePath": "validation/reports/pairwise70_cardio_benchmark/pairwise70_cardio_end_to_end_report.json",
          "summary": "45/45 prepared cardiovascular datasets passed using ClinicalTrials.gov, PubMed, and OpenAlex only, with no PDF extraction pipeline.",
          "tier": "domain",
          "verdict": "PASS"
        },
        "report_summary": {
          "scope": {
            "domain": "cardiovascular",
            "design": "RCT-focused Pairwise70 Cochrane study-level",
            "sources": [
              "ClinicalTrials.gov",
              "AACT",
              "PubMed",
              "OpenAlex"
            ],
            "pdf_pipeline_used": false
          },
          "counts": {
            "cardio_review_ids": 52,
            "cardio_dataset_files": 47,
            "prepared_datasets": 45,
            "skipped_datasets": 2,
            "pass": 45,
            "fail": 0,
            "error": 0,
            "pass_rate": 100.0
          },
          "elapsed_seconds": 9.37
        }
      }
    },
    "pcsk9_ldlc": {
      "category": "Lipids",
      "extraction": {
        "ctgov": {
          "has2x2": false,
          "hasReportedEffect": false,
          "hasResults": true,
          "matchScore": 39,
          "matchedOutcome": "Percentage Change in Total Cholesterol From Baseline to Day 510",
          "recordExtract": "Percentage Change in Total Cholesterol From Baseline to Day 510 | Tx --/-- vs Ctrl --/--",
          "sampleNctId": "NCT03400800",
          "success": false
        },
        "pubmed": {
          "effectCount": 2,
          "firstExtract": "HR: 1.11; 95% CI: 1.02-1.21",
          "pmid": "41369622",
          "success": true,
          "title": "Obesity-Associated Cardiovascular Risk and Benefit From PCSK9 Inhibition: A Prespecified Analysis From FOURIER."
        }
      },
      "failReasons": [
        "ctgov_anchor_recall",
        "ctgov_extract"
      ],
      "name": "PCSK9 pathway inhibitors - LDL-C reduction",
      "policy": {
        "allowedSources": [
          "ctgov",
          "pubmed",
          "openalex"
        ],
        "extractionMode": "pubmed-abstract-and-ctgov-records-only",
        "pass": true,
        "pdfUploadHidden": true,
        "pdfViewerHidden": true,
        "yearFloor": 2015
      },
      "screening": {
        "humanCheckable": true,
        "recordsWithAnchors": 0
      },
      "search": {
        "ctgov": {
          "anchorRecall": 0,
          "count": 17,
          "eligible": 4,
          "firstResult": {
            "nctId": "NCT05639218",
            "title": "Impact of Optimal Pharmacotherapy on Plasma Lipid Profile and Qualitative Features of Atherosclerotic Plaques in Very-high Cardiovascular Risk Patients With Established Atherosclerotic Cardiovascular Disease",
            "year": "2021"
          },
          "matched": [],
          "statusText": "CT.gov: kept 17 trials after applying the 2015+ floor"
        },
        "openalex": {
          "anchorRecall": 0.5,
          "count": 20,
          "eligible": 4,
          "firstResult": {
            "doi": "10.1056/nejmoa1500858",
            "nctId": "NCT01439880",
            "title": "Efficacy and Safety of Evolocumab in Reducing Lipids and Cardiovascular Events",
            "year": "2015"
          },
          "matched": [
            "NCT01764633",
            "NCT01663402"
          ],
          "statusText": "OpenAlex: kept 20 records after applying the 2015+ floor"
        },
        "pubmed": {
          "anchorRecall": 1,
          "count": 20,
          "eligible": 4,
          "firstResult": {
            "doi": "10.1016/j.atherosclerosis.2026.120686",
            "pmid": "41806515",
            "title": "LDL subspecies and lipidome change by evolocumab add-on therapy to empagliflozin in patients with type 2 diabetes: A prespecified secondary analysis of a randomized clinical trial.",
            "year": "2026"
          },
          "matched": [
            "NCT01764633",
            "NCT01663402",
            "NCT03399370",
            "NCT03400800"
          ],
          "statusText": "1832 total results (PubMed: 20)"
        }
      },
      "status": "warn",
      "topicId": "pcsk9_ldlc",
      "validationPackId": "pairwise70_cardio",
      "id": "pcsk9_ldlc",
      "pack": {
        "id": "pairwise70_cardio",
        "meta": {
          "counts": {
            "error": 0,
            "fail": 0,
            "pass": 45,
            "passRate": 100,
            "prepared": 45
          },
          "date": "2026-02-27",
          "id": "pairwise70_cardio",
          "name": "Pairwise70 Cardio End-to-End",
          "sourcePath": "validation/reports/pairwise70_cardio_benchmark/pairwise70_cardio_end_to_end_report.json",
          "summary": "45/45 prepared cardiovascular datasets passed using ClinicalTrials.gov, PubMed, and OpenAlex only, with no PDF extraction pipeline.",
          "tier": "domain",
          "verdict": "PASS"
        },
        "report_summary": {
          "scope": {
            "domain": "cardiovascular",
            "design": "RCT-focused Pairwise70 Cochrane study-level",
            "sources": [
              "ClinicalTrials.gov",
              "AACT",
              "PubMed",
              "OpenAlex"
            ],
            "pdf_pipeline_used": false
          },
          "counts": {
            "cardio_review_ids": 52,
            "cardio_dataset_files": 47,
            "prepared_datasets": 45,
            "skipped_datasets": 2,
            "pass": 45,
            "fail": 0,
            "error": 0,
            "pass_rate": 100.0
          },
          "elapsed_seconds": 9.37
        }
      }
    },
    "pcsk9_inclisiran": {
      "category": "Lipids",
      "extraction": {
        "ctgov": {
          "has2x2": false,
          "hasReportedEffect": false,
          "hasResults": true,
          "matchScore": 27,
          "matchedOutcome": "Percentage Change in Total Cholesterol From Baseline to Day 510",
          "recordExtract": "Percentage Change in Total Cholesterol From Baseline to Day 510 | Tx --/-- vs Ctrl --/--",
          "sampleNctId": "NCT03400800",
          "success": false
        },
        "pubmed": {
          "effectCount": 2,
          "firstExtract": "HR: 1.11; 95% CI: 1.02-1.21",
          "pmid": "41369622",
          "success": true,
          "title": "Obesity-Associated Cardiovascular Risk and Benefit From PCSK9 Inhibition: A Prespecified Analysis From FOURIER."
        }
      },
      "failReasons": [
        "ctgov_anchor_recall",
        "ctgov_extract"
      ],
      "name": "PCSK9 pathway inhibitors - Inclisiran subgroup",
      "policy": {
        "allowedSources": [
          "ctgov",
          "pubmed",
          "openalex"
        ],
        "extractionMode": "pubmed-abstract-and-ctgov-records-only",
        "pass": true,
        "pdfUploadHidden": true,
        "pdfViewerHidden": true,
        "yearFloor": 2015
      },
      "screening": {
        "humanCheckable": true,
        "recordsWithAnchors": 0
      },
      "search": {
        "ctgov": {
          "anchorRecall": 0,
          "count": 17,
          "eligible": 4,
          "firstResult": {
            "nctId": "NCT05639218",
            "title": "Impact of Optimal Pharmacotherapy on Plasma Lipid Profile and Qualitative Features of Atherosclerotic Plaques in Very-high Cardiovascular Risk Patients With Established Atherosclerotic Cardiovascular Disease",
            "year": "2021"
          },
          "matched": [],
          "statusText": "CT.gov: kept 17 trials after applying the 2015+ floor"
        },
        "openalex": {
          "anchorRecall": 0.5,
          "count": 20,
          "eligible": 4,
          "firstResult": {
            "doi": "10.1056/nejmoa1500858",
            "nctId": "NCT01439880",
            "title": "Efficacy and Safety of Evolocumab in Reducing Lipids and Cardiovascular Events",
            "year": "2015"
          },
          "matched": [
            "NCT01764633",
            "NCT01663402"
          ],
          "statusText": "OpenAlex: kept 20 records after applying the 2015+ floor"
        },
        "pubmed": {
          "anchorRecall": 1,
          "count": 20,
          "eligible": 4,
          "firstResult": {
            "doi": "10.1016/j.atherosclerosis.2026.120686",
            "pmid": "41806515",
            "title": "LDL subspecies and lipidome change by evolocumab add-on therapy to empagliflozin in patients with type 2 diabetes: A prespecified secondary analysis of a randomized clinical trial.",
            "year": "2026"
          },
          "matched": [
            "NCT01764633",
            "NCT01663402",
            "NCT03399370",
            "NCT03400800"
          ],
          "statusText": "1889 total results (PubMed: 20)"
        }
      },
      "status": "warn",
      "topicId": "pcsk9_inclisiran",
      "validationPackId": "pairwise70_cardio",
      "id": "pcsk9_inclisiran",
      "pack": {
        "id": "pairwise70_cardio",
        "meta": {
          "counts": {
            "error": 0,
            "fail": 0,
            "pass": 45,
            "passRate": 100,
            "prepared": 45
          },
          "date": "2026-02-27",
          "id": "pairwise70_cardio",
          "name": "Pairwise70 Cardio End-to-End",
          "sourcePath": "validation/reports/pairwise70_cardio_benchmark/pairwise70_cardio_end_to_end_report.json",
          "summary": "45/45 prepared cardiovascular datasets passed using ClinicalTrials.gov, PubMed, and OpenAlex only, with no PDF extraction pipeline.",
          "tier": "domain",
          "verdict": "PASS"
        },
        "report_summary": {
          "scope": {
            "domain": "cardiovascular",
            "design": "RCT-focused Pairwise70 Cochrane study-level",
            "sources": [
              "ClinicalTrials.gov",
              "AACT",
              "PubMed",
              "OpenAlex"
            ],
            "pdf_pipeline_used": false
          },
          "counts": {
            "cardio_review_ids": 52,
            "cardio_dataset_files": 47,
            "prepared_datasets": 45,
            "skipped_datasets": 2,
            "pass": 45,
            "fail": 0,
            "error": 0,
            "pass_rate": 100.0
          },
          "elapsed_seconds": 9.37
        }
      }
    },
    "bempedoic_mace": {
      "category": "Lipids",
      "extraction": {
        "ctgov": {
          "has2x2": false,
          "hasReportedEffect": false,
          "hasResults": true,
          "matchScore": 98,
          "matchedOutcome": "Number of Participants With First Occurrence of Four Component Major Adverse Cardiovascular Events (MACE)",
          "recordExtract": "Number of Participants With First Occurrence of Four Component Major Adverse Cardiovascular Events (MACE) | Tx --/-- vs Ctrl --/--",
          "sampleNctId": "NCT02993406",
          "success": false
        },
        "pubmed": {
          "effectCount": 1,
          "firstExtract": "HR, 0.68 [95% CI, 0.53-0.86]",
          "pmid": "39921511",
          "success": true,
          "title": "Bempedoic Acid for Prevention of Cardiovascular Events in People With Obesity: A CLEAR Outcomes Subset Analysis."
        }
      },
      "failReasons": [
        "ctgov_extract"
      ],
      "name": "Bempedoic acid - MACE",
      "policy": {
        "allowedSources": [
          "ctgov",
          "pubmed",
          "openalex"
        ],
        "extractionMode": "pubmed-abstract-and-ctgov-records-only",
        "pass": true,
        "pdfUploadHidden": true,
        "pdfViewerHidden": true,
        "yearFloor": 2015
      },
      "screening": {
        "humanCheckable": true,
        "recordsWithAnchors": 2
      },
      "search": {
        "ctgov": {
          "anchorRecall": 0.5,
          "count": 17,
          "eligible": 4,
          "firstResult": {
            "nctId": "NCT07255820",
            "title": "Comparative Efficacy and Safety of Dual Versus Triple Lipid-Lowering Therapies (Rosuvastatin/Ezetimibe, Bempedoic Acid/Ezetimibe, and Rosuvastatin/Ezetimibe/Bempedoic Acid ) in Type 2 Diabetes Mellitus Patients With Elevated LDL Cholesterol",
            "year": "2026"
          },
          "matched": [
            "NCT02988115",
            "NCT02993406"
          ],
          "statusText": "CT.gov: kept 17 trials after applying the 2015+ floor"
        },
        "openalex": {
          "anchorRecall": 0.5,
          "count": 20,
          "eligible": 4,
          "firstResult": {
            "doi": "10.1161/jaha.118.011662",
            "pmid": "30922146",
            "title": "Efficacy and Safety of Bempedoic Acid in Patients With Hypercholesterolemia and Statin Intolerance",
            "year": "2019"
          },
          "matched": [
            "NCT02991118",
            "NCT02993406"
          ],
          "statusText": "OpenAlex: kept 20 records after applying the 2015+ floor"
        },
        "pubmed": {
          "anchorRecall": 0.25,
          "count": 19,
          "eligible": 4,
          "firstResult": {
            "doi": "10.1016/j.ajpc.2026.101417",
            "pmid": "41624043",
            "title": "Progress in risk assessment and management: Forecasting updates across international cholesterol guidelines.",
            "year": "2026"
          },
          "matched": [
            "NCT02993406"
          ],
          "statusText": "1945 total results (PubMed: 19)"
        }
      },
      "status": "warn",
      "topicId": "bempedoic_mace",
      "validationPackId": "pairwise70_cardio",
      "id": "bempedoic_mace",
      "pack": {
        "id": "pairwise70_cardio",
        "meta": {
          "counts": {
            "error": 0,
            "fail": 0,
            "pass": 45,
            "passRate": 100,
            "prepared": 45
          },
          "date": "2026-02-27",
          "id": "pairwise70_cardio",
          "name": "Pairwise70 Cardio End-to-End",
          "sourcePath": "validation/reports/pairwise70_cardio_benchmark/pairwise70_cardio_end_to_end_report.json",
          "summary": "45/45 prepared cardiovascular datasets passed using ClinicalTrials.gov, PubMed, and OpenAlex only, with no PDF extraction pipeline.",
          "tier": "domain",
          "verdict": "PASS"
        },
        "report_summary": {
          "scope": {
            "domain": "cardiovascular",
            "design": "RCT-focused Pairwise70 Cochrane study-level",
            "sources": [
              "ClinicalTrials.gov",
              "AACT",
              "PubMed",
              "OpenAlex"
            ],
            "pdf_pipeline_used": false
          },
          "counts": {
            "cardio_review_ids": 52,
            "cardio_dataset_files": 47,
            "prepared_datasets": 45,
            "skipped_datasets": 2,
            "pass": 45,
            "fail": 0,
            "error": 0,
            "pass_rate": 100.0
          },
          "elapsed_seconds": 9.37
        }
      }
    },
    "bempedoic_ldlc": {
      "category": "Lipids",
      "extraction": {
        "ctgov": {
          "has2x2": false,
          "hasReportedEffect": false,
          "hasResults": true,
          "matchScore": 15,
          "matchedOutcome": "Number of Participants With First Occurrence of Four Component Major Adverse Cardiovascular Events (MACE)",
          "recordExtract": "Number of Participants With First Occurrence of Four Component Major Adverse Cardiovascular Events (MACE) | Tx --/-- vs Ctrl --/--",
          "sampleNctId": "NCT02993406",
          "success": false
        },
        "pubmed": {
          "effectCount": 1,
          "firstExtract": "HR, 0.68 [95% CI, 0.53-0.86]",
          "pmid": "39921511",
          "success": true,
          "title": "Bempedoic Acid for Prevention of Cardiovascular Events in People With Obesity: A CLEAR Outcomes Subset Analysis."
        }
      },
      "failReasons": [
        "ctgov_extract"
      ],
      "name": "Bempedoic acid - LDL-C reduction",
      "policy": {
        "allowedSources": [
          "ctgov",
          "pubmed",
          "openalex"
        ],
        "extractionMode": "pubmed-abstract-and-ctgov-records-only",
        "pass": true,
        "pdfUploadHidden": true,
        "pdfViewerHidden": true,
        "yearFloor": 2015
      },
      "screening": {
        "humanCheckable": true,
        "recordsWithAnchors": 2
      },
      "search": {
        "ctgov": {
          "anchorRecall": 0.5,
          "count": 17,
          "eligible": 4,
          "firstResult": {
            "nctId": "NCT07255820",
            "title": "Comparative Efficacy and Safety of Dual Versus Triple Lipid-Lowering Therapies (Rosuvastatin/Ezetimibe, Bempedoic Acid/Ezetimibe, and Rosuvastatin/Ezetimibe/Bempedoic Acid ) in Type 2 Diabetes Mellitus Patients With Elevated LDL Cholesterol",
            "year": "2026"
          },
          "matched": [
            "NCT02988115",
            "NCT02993406"
          ],
          "statusText": "CT.gov: kept 17 trials after applying the 2015+ floor"
        },
        "openalex": {
          "anchorRecall": 0.5,
          "count": 20,
          "eligible": 4,
          "firstResult": {
            "doi": "10.1161/jaha.118.011662",
            "pmid": "30922146",
            "title": "Efficacy and Safety of Bempedoic Acid in Patients With Hypercholesterolemia and Statin Intolerance",
            "year": "2019"
          },
          "matched": [
            "NCT02991118",
            "NCT02993406"
          ],
          "statusText": "OpenAlex: kept 20 records after applying the 2015+ floor"
        },
        "pubmed": {
          "anchorRecall": 0.25,
          "count": 19,
          "eligible": 4,
          "firstResult": {
            "doi": "10.1016/j.ajpc.2026.101417",
            "pmid": "41624043",
            "title": "Progress in risk assessment and management: Forecasting updates across international cholesterol guidelines.",
            "year": "2026"
          },
          "matched": [
            "NCT02993406"
          ],
          "statusText": "2001 total results (PubMed: 19)"
        }
      },
      "status": "warn",
      "topicId": "bempedoic_ldlc",
      "validationPackId": "pairwise70_cardio",
      "id": "bempedoic_ldlc",
      "pack": {
        "id": "pairwise70_cardio",
        "meta": {
          "counts": {
            "error": 0,
            "fail": 0,
            "pass": 45,
            "passRate": 100,
            "prepared": 45
          },
          "date": "2026-02-27",
          "id": "pairwise70_cardio",
          "name": "Pairwise70 Cardio End-to-End",
          "sourcePath": "validation/reports/pairwise70_cardio_benchmark/pairwise70_cardio_end_to_end_report.json",
          "summary": "45/45 prepared cardiovascular datasets passed using ClinicalTrials.gov, PubMed, and OpenAlex only, with no PDF extraction pipeline.",
          "tier": "domain",
          "verdict": "PASS"
        },
        "report_summary": {
          "scope": {
            "domain": "cardiovascular",
            "design": "RCT-focused Pairwise70 Cochrane study-level",
            "sources": [
              "ClinicalTrials.gov",
              "AACT",
              "PubMed",
              "OpenAlex"
            ],
            "pdf_pipeline_used": false
          },
          "counts": {
            "cardio_review_ids": 52,
            "cardio_dataset_files": 47,
            "prepared_datasets": 45,
            "skipped_datasets": 2,
            "pass": 45,
            "fail": 0,
            "error": 0,
            "pass_rate": 100.0
          },
          "elapsed_seconds": 9.37
        }
      }
    },
    "bempedoic_statin_intolerance": {
      "category": "Lipids",
      "extraction": {
        "ctgov": {
          "has2x2": false,
          "hasReportedEffect": false,
          "hasResults": true,
          "matchScore": 27,
          "matchedOutcome": "Number of Participants With First Occurrence of Four Component Major Adverse Cardiovascular Events (MACE)",
          "recordExtract": "Number of Participants With First Occurrence of Four Component Major Adverse Cardiovascular Events (MACE) | Tx --/-- vs Ctrl --/--",
          "sampleNctId": "NCT02993406",
          "success": false
        },
        "pubmed": {
          "effectCount": 1,
          "firstExtract": "HR, 0.68 [95% CI, 0.53-0.86]",
          "pmid": "39921511",
          "success": true,
          "title": "Bempedoic Acid for Prevention of Cardiovascular Events in People With Obesity: A CLEAR Outcomes Subset Analysis."
        }
      },
      "failReasons": [
        "ctgov_extract"
      ],
      "name": "Bempedoic acid - Statin-intolerant subgroup",
      "policy": {
        "allowedSources": [
          "ctgov",
          "pubmed",
          "openalex"
        ],
        "extractionMode": "pubmed-abstract-and-ctgov-records-only",
        "pass": true,
        "pdfUploadHidden": true,
        "pdfViewerHidden": true,
        "yearFloor": 2015
      },
      "screening": {
        "humanCheckable": true,
        "recordsWithAnchors": 2
      },
      "search": {
        "ctgov": {
          "anchorRecall": 0.5,
          "count": 17,
          "eligible": 4,
          "firstResult": {
            "nctId": "NCT07255820",
            "title": "Comparative Efficacy and Safety of Dual Versus Triple Lipid-Lowering Therapies (Rosuvastatin/Ezetimibe, Bempedoic Acid/Ezetimibe, and Rosuvastatin/Ezetimibe/Bempedoic Acid ) in Type 2 Diabetes Mellitus Patients With Elevated LDL Cholesterol",
            "year": "2026"
          },
          "matched": [
            "NCT02988115",
            "NCT02993406"
          ],
          "statusText": "CT.gov: kept 17 trials after applying the 2015+ floor"
        },
        "openalex": {
          "anchorRecall": 0.5,
          "count": 20,
          "eligible": 4,
          "firstResult": {
            "doi": "10.1161/jaha.118.011662",
            "pmid": "30922146",
            "title": "Efficacy and Safety of Bempedoic Acid in Patients With Hypercholesterolemia and Statin Intolerance",
            "year": "2019"
          },
          "matched": [
            "NCT02991118",
            "NCT02993406"
          ],
          "statusText": "OpenAlex: kept 20 records after applying the 2015+ floor"
        },
        "pubmed": {
          "anchorRecall": 0.25,
          "count": 19,
          "eligible": 4,
          "firstResult": {
            "doi": "10.1016/j.ajpc.2026.101417",
            "pmid": "41624043",
            "title": "Progress in risk assessment and management: Forecasting updates across international cholesterol guidelines.",
            "year": "2026"
          },
          "matched": [
            "NCT02993406"
          ],
          "statusText": "2057 total results (PubMed: 19)"
        }
      },
      "status": "warn",
      "topicId": "bempedoic_statin_intolerance",
      "validationPackId": "pairwise70_cardio",
      "id": "bempedoic_statin_intolerance",
      "pack": {
        "id": "pairwise70_cardio",
        "meta": {
          "counts": {
            "error": 0,
            "fail": 0,
            "pass": 45,
            "passRate": 100,
            "prepared": 45
          },
          "date": "2026-02-27",
          "id": "pairwise70_cardio",
          "name": "Pairwise70 Cardio End-to-End",
          "sourcePath": "validation/reports/pairwise70_cardio_benchmark/pairwise70_cardio_end_to_end_report.json",
          "summary": "45/45 prepared cardiovascular datasets passed using ClinicalTrials.gov, PubMed, and OpenAlex only, with no PDF extraction pipeline.",
          "tier": "domain",
          "verdict": "PASS"
        },
        "report_summary": {
          "scope": {
            "domain": "cardiovascular",
            "design": "RCT-focused Pairwise70 Cochrane study-level",
            "sources": [
              "ClinicalTrials.gov",
              "AACT",
              "PubMed",
              "OpenAlex"
            ],
            "pdf_pipeline_used": false
          },
          "counts": {
            "cardio_review_ids": 52,
            "cardio_dataset_files": 47,
            "prepared_datasets": 45,
            "skipped_datasets": 2,
            "pass": 45,
            "fail": 0,
            "error": 0,
            "pass_rate": 100.0
          },
          "elapsed_seconds": 9.37
        }
      }
    },
    "intensive_bp_mace": {
      "category": "Hypertension",
      "extraction": {
        "ctgov": {
          "has2x2": false,
          "hasReportedEffect": false,
          "hasResults": false,
          "matchScore": 33,
          "matchedOutcome": "Number of Participants With First Occurrence of a Myocardial Infarction (MI), Acute Coronary Syndrome (ACS), Stroke, Heart Failure (HF), or CVD Death",
          "recordExtract": "Number of Participants With First Occurrence of a Myocardial Infarction (MI), Acute Coronary Syndrome (ACS), Stroke, Heart Failure (HF), or CVD Death | Tx --/-- vs Ctrl --/--",
          "sampleNctId": "NCT04993924",
          "success": false
        },
        "pubmed": {
          "effectCount": 1,
          "firstExtract": "rate ratio 0.93 (95% CI 0.81 to 1.05",
          "pmid": "41365607",
          "success": true,
          "title": "Association of blood pressure control with atrial and ventricular ectopy in SPRINT."
        }
      },
      "failReasons": [
        "ctgov_anchor_recall",
        "ctgov_extract"
      ],
      "name": "Intensive blood pressure targets - MACE",
      "policy": {
        "allowedSources": [
          "ctgov",
          "pubmed",
          "openalex"
        ],
        "extractionMode": "pubmed-abstract-and-ctgov-records-only",
        "pass": true,
        "pdfUploadHidden": true,
        "pdfViewerHidden": true,
        "yearFloor": 2015
      },
      "screening": {
        "humanCheckable": true,
        "recordsWithAnchors": 0
      },
      "search": {
        "ctgov": {
          "anchorRecall": 0,
          "count": 14,
          "eligible": 3,
          "firstResult": {
            "nctId": "NCT06431178",
            "title": "A Comparative Study Between General Anesthesia Versus Sedation By Dexmedetomidine and Ketamine With Local Infiltration for Percutaneous Transcatheter Closure of Atrial Septal Defect in Pediatric Patients",
            "year": "2024"
          },
          "matched": [],
          "statusText": "CT.gov: kept 14 trials after applying the 2015+ floor"
        },
        "openalex": {
          "anchorRecall": 0.6666666666666666,
          "count": 20,
          "eligible": 3,
          "firstResult": {
            "doi": "10.1159/000455130",
            "pmid": "28161697",
            "title": "In the Wake of Systolic Blood Pressure Intervention Trial: New Targets for Improving Hypertension Management in Chronic Kidney Disease?",
            "year": "2017"
          },
          "matched": [
            "NCT01206062",
            "NCT03015311"
          ],
          "statusText": "OpenAlex: kept 20 records after applying the 2015+ floor"
        },
        "pubmed": {
          "anchorRecall": 1,
          "count": 20,
          "eligible": 3,
          "firstResult": {
            "doi": "10.1186/s12916-026-04678-2",
            "nctId": "NCT03527719",
            "pmid": "41776553",
            "title": "Cardiovascular outcomes of intensive blood pressure control in patients with and without metabolic dysfunction-associated fatty liver disease: post hoc analysis of the CRHCP trial.",
            "year": "2026"
          },
          "matched": [
            "NCT01206062",
            "NCT03015311",
            "NCT04993924"
          ],
          "statusText": "2111 total results (PubMed: 20)"
        }
      },
      "status": "warn",
      "topicId": "intensive_bp_mace",
      "validationPackId": "pairwise70_cardio",
      "id": "intensive_bp_mace",
      "pack": {
        "id": "pairwise70_cardio",
        "meta": {
          "counts": {
            "error": 0,
            "fail": 0,
            "pass": 45,
            "passRate": 100,
            "prepared": 45
          },
          "date": "2026-02-27",
          "id": "pairwise70_cardio",
          "name": "Pairwise70 Cardio End-to-End",
          "sourcePath": "validation/reports/pairwise70_cardio_benchmark/pairwise70_cardio_end_to_end_report.json",
          "summary": "45/45 prepared cardiovascular datasets passed using ClinicalTrials.gov, PubMed, and OpenAlex only, with no PDF extraction pipeline.",
          "tier": "domain",
          "verdict": "PASS"
        },
        "report_summary": {
          "scope": {
            "domain": "cardiovascular",
            "design": "RCT-focused Pairwise70 Cochrane study-level",
            "sources": [
              "ClinicalTrials.gov",
              "AACT",
              "PubMed",
              "OpenAlex"
            ],
            "pdf_pipeline_used": false
          },
          "counts": {
            "cardio_review_ids": 52,
            "cardio_dataset_files": 47,
            "prepared_datasets": 45,
            "skipped_datasets": 2,
            "pass": 45,
            "fail": 0,
            "error": 0,
            "pass_rate": 100.0
          },
          "elapsed_seconds": 9.37
        }
      }
    },
    "intensive_bp_stroke": {
      "category": "Hypertension",
      "extraction": {
        "ctgov": {
          "has2x2": false,
          "hasReportedEffect": false,
          "hasResults": false,
          "matchScore": 45,
          "matchedOutcome": "Number of Participants With First Occurrence of a Myocardial Infarction (MI), Acute Coronary Syndrome (ACS), Stroke, Heart Failure (HF), or CVD Death",
          "recordExtract": "Number of Participants With First Occurrence of a Myocardial Infarction (MI), Acute Coronary Syndrome (ACS), Stroke, Heart Failure (HF), or CVD Death | Tx --/-- vs Ctrl --/--",
          "sampleNctId": "NCT04993924",
          "success": false
        },
        "pubmed": {
          "effectCount": 1,
          "firstExtract": "rate ratio 0.93 (95% CI 0.81 to 1.05",
          "pmid": "41365607",
          "success": true,
          "title": "Association of blood pressure control with atrial and ventricular ectopy in SPRINT."
        }
      },
      "failReasons": [
        "ctgov_anchor_recall",
        "ctgov_extract"
      ],
      "name": "Intensive blood pressure targets - Stroke",
      "policy": {
        "allowedSources": [
          "ctgov",
          "pubmed",
          "openalex"
        ],
        "extractionMode": "pubmed-abstract-and-ctgov-records-only",
        "pass": true,
        "pdfUploadHidden": true,
        "pdfViewerHidden": true,
        "yearFloor": 2015
      },
      "screening": {
        "humanCheckable": true,
        "recordsWithAnchors": 0
      },
      "search": {
        "ctgov": {
          "anchorRecall": 0,
          "count": 14,
          "eligible": 3,
          "firstResult": {
            "nctId": "NCT06431178",
            "title": "A Comparative Study Between General Anesthesia Versus Sedation By Dexmedetomidine and Ketamine With Local Infiltration for Percutaneous Transcatheter Closure of Atrial Septal Defect in Pediatric Patients",
            "year": "2024"
          },
          "matched": [],
          "statusText": "CT.gov: kept 14 trials after applying the 2015+ floor"
        },
        "openalex": {
          "anchorRecall": 0.6666666666666666,
          "count": 20,
          "eligible": 3,
          "firstResult": {
            "doi": "10.1159/000455130",
            "pmid": "28161697",
            "title": "In the Wake of Systolic Blood Pressure Intervention Trial: New Targets for Improving Hypertension Management in Chronic Kidney Disease?",
            "year": "2017"
          },
          "matched": [
            "NCT01206062",
            "NCT03015311"
          ],
          "statusText": "OpenAlex: kept 20 records after applying the 2015+ floor"
        },
        "pubmed": {
          "anchorRecall": 1,
          "count": 20,
          "eligible": 3,
          "firstResult": {
            "doi": "10.1186/s12916-026-04678-2",
            "nctId": "NCT03527719",
            "pmid": "41776553",
            "title": "Cardiovascular outcomes of intensive blood pressure control in patients with and without metabolic dysfunction-associated fatty liver disease: post hoc analysis of the CRHCP trial.",
            "year": "2026"
          },
          "matched": [
            "NCT01206062",
            "NCT03015311",
            "NCT04993924"
          ],
          "statusText": "2165 total results (PubMed: 20)"
        }
      },
      "status": "warn",
      "topicId": "intensive_bp_stroke",
      "validationPackId": "pairwise70_cardio",
      "id": "intensive_bp_stroke",
      "pack": {
        "id": "pairwise70_cardio",
        "meta": {
          "counts": {
            "error": 0,
            "fail": 0,
            "pass": 45,
            "passRate": 100,
            "prepared": 45
          },
          "date": "2026-02-27",
          "id": "pairwise70_cardio",
          "name": "Pairwise70 Cardio End-to-End",
          "sourcePath": "validation/reports/pairwise70_cardio_benchmark/pairwise70_cardio_end_to_end_report.json",
          "summary": "45/45 prepared cardiovascular datasets passed using ClinicalTrials.gov, PubMed, and OpenAlex only, with no PDF extraction pipeline.",
          "tier": "domain",
          "verdict": "PASS"
        },
        "report_summary": {
          "scope": {
            "domain": "cardiovascular",
            "design": "RCT-focused Pairwise70 Cochrane study-level",
            "sources": [
              "ClinicalTrials.gov",
              "AACT",
              "PubMed",
              "OpenAlex"
            ],
            "pdf_pipeline_used": false
          },
          "counts": {
            "cardio_review_ids": 52,
            "cardio_dataset_files": 47,
            "prepared_datasets": 45,
            "skipped_datasets": 2,
            "pass": 45,
            "fail": 0,
            "error": 0,
            "pass_rate": 100.0
          },
          "elapsed_seconds": 9.37
        }
      }
    },
    "intensive_bp_ckd": {
      "category": "Hypertension",
      "extraction": {
        "ctgov": {
          "has2x2": false,
          "hasReportedEffect": false,
          "hasResults": false,
          "matchScore": 45,
          "matchedOutcome": "Number of CKD Participants Who Experienced a 50% Decline From Baseline eGFR",
          "recordExtract": "Number of CKD Participants Who Experienced a 50% Decline From Baseline eGFR | Tx --/-- vs Ctrl --/--",
          "sampleNctId": "NCT04993924",
          "success": false
        },
        "pubmed": {
          "effectCount": 1,
          "firstExtract": "rate ratio 0.93 (95% CI 0.81 to 1.05",
          "pmid": "41365607",
          "success": true,
          "title": "Association of blood pressure control with atrial and ventricular ectopy in SPRINT."
        }
      },
      "failReasons": [
        "ctgov_anchor_recall",
        "ctgov_extract"
      ],
      "name": "Intensive blood pressure targets - Kidney outcomes",
      "policy": {
        "allowedSources": [
          "ctgov",
          "pubmed",
          "openalex"
        ],
        "extractionMode": "pubmed-abstract-and-ctgov-records-only",
        "pass": true,
        "pdfUploadHidden": true,
        "pdfViewerHidden": true,
        "yearFloor": 2015
      },
      "screening": {
        "humanCheckable": true,
        "recordsWithAnchors": 0
      },
      "search": {
        "ctgov": {
          "anchorRecall": 0,
          "count": 14,
          "eligible": 3,
          "firstResult": {
            "nctId": "NCT06431178",
            "title": "A Comparative Study Between General Anesthesia Versus Sedation By Dexmedetomidine and Ketamine With Local Infiltration for Percutaneous Transcatheter Closure of Atrial Septal Defect in Pediatric Patients",
            "year": "2024"
          },
          "matched": [],
          "statusText": "CT.gov: kept 14 trials after applying the 2015+ floor"
        },
        "openalex": {
          "anchorRecall": 0.6666666666666666,
          "count": 20,
          "eligible": 3,
          "firstResult": {
            "doi": "10.1159/000455130",
            "pmid": "28161697",
            "title": "In the Wake of Systolic Blood Pressure Intervention Trial: New Targets for Improving Hypertension Management in Chronic Kidney Disease?",
            "year": "2017"
          },
          "matched": [
            "NCT01206062",
            "NCT03015311"
          ],
          "statusText": "OpenAlex: kept 20 records after applying the 2015+ floor"
        },
        "pubmed": {
          "anchorRecall": 1,
          "count": 20,
          "eligible": 3,
          "firstResult": {
            "doi": "10.1186/s12916-026-04678-2",
            "nctId": "NCT03527719",
            "pmid": "41776553",
            "title": "Cardiovascular outcomes of intensive blood pressure control in patients with and without metabolic dysfunction-associated fatty liver disease: post hoc analysis of the CRHCP trial.",
            "year": "2026"
          },
          "matched": [
            "NCT01206062",
            "NCT03015311",
            "NCT04993924"
          ],
          "statusText": "2219 total results (PubMed: 20)"
        }
      },
      "status": "warn",
      "topicId": "intensive_bp_ckd",
      "validationPackId": "pairwise70_cardio",
      "id": "intensive_bp_ckd",
      "pack": {
        "id": "pairwise70_cardio",
        "meta": {
          "counts": {
            "error": 0,
            "fail": 0,
            "pass": 45,
            "passRate": 100,
            "prepared": 45
          },
          "date": "2026-02-27",
          "id": "pairwise70_cardio",
          "name": "Pairwise70 Cardio End-to-End",
          "sourcePath": "validation/reports/pairwise70_cardio_benchmark/pairwise70_cardio_end_to_end_report.json",
          "summary": "45/45 prepared cardiovascular datasets passed using ClinicalTrials.gov, PubMed, and OpenAlex only, with no PDF extraction pipeline.",
          "tier": "domain",
          "verdict": "PASS"
        },
        "report_summary": {
          "scope": {
            "domain": "cardiovascular",
            "design": "RCT-focused Pairwise70 Cochrane study-level",
            "sources": [
              "ClinicalTrials.gov",
              "AACT",
              "PubMed",
              "OpenAlex"
            ],
            "pdf_pipeline_used": false
          },
          "counts": {
            "cardio_review_ids": 52,
            "cardio_dataset_files": 47,
            "prepared_datasets": 45,
            "skipped_datasets": 2,
            "pass": 45,
            "fail": 0,
            "error": 0,
            "pass_rate": 100.0
          },
          "elapsed_seconds": 9.37
        }
      }
    },
    "intensive_bp_elderly": {
      "category": "Hypertension",
      "extraction": {
        "ctgov": {
          "has2x2": false,
          "hasReportedEffect": false,
          "hasResults": false,
          "matchScore": 27,
          "matchedOutcome": "Number of Participants With First Occurrence of a Myocardial Infarction (MI), Acute Coronary Syndrome (ACS), Stroke, Heart Failure (HF), or CVD Death",
          "recordExtract": "Number of Participants With First Occurrence of a Myocardial Infarction (MI), Acute Coronary Syndrome (ACS), Stroke, Heart Failure (HF), or CVD Death | Tx --/-- vs Ctrl --/--",
          "sampleNctId": "NCT04993924",
          "success": false
        },
        "pubmed": {
          "effectCount": 1,
          "firstExtract": "rate ratio 0.93 (95% CI 0.81 to 1.05",
          "pmid": "41365607",
          "success": true,
          "title": "Association of blood pressure control with atrial and ventricular ectopy in SPRINT."
        }
      },
      "failReasons": [
        "ctgov_anchor_recall",
        "ctgov_extract"
      ],
      "name": "Intensive blood pressure targets - Older adults",
      "policy": {
        "allowedSources": [
          "ctgov",
          "pubmed",
          "openalex"
        ],
        "extractionMode": "pubmed-abstract-and-ctgov-records-only",
        "pass": true,
        "pdfUploadHidden": true,
        "pdfViewerHidden": true,
        "yearFloor": 2015
      },
      "screening": {
        "humanCheckable": true,
        "recordsWithAnchors": 0
      },
      "search": {
        "ctgov": {
          "anchorRecall": 0,
          "count": 14,
          "eligible": 3,
          "firstResult": {
            "nctId": "NCT06431178",
            "title": "A Comparative Study Between General Anesthesia Versus Sedation By Dexmedetomidine and Ketamine With Local Infiltration for Percutaneous Transcatheter Closure of Atrial Septal Defect in Pediatric Patients",
            "year": "2024"
          },
          "matched": [],
          "statusText": "CT.gov: kept 14 trials after applying the 2015+ floor"
        },
        "openalex": {
          "anchorRecall": 0.6666666666666666,
          "count": 20,
          "eligible": 3,
          "firstResult": {
            "doi": "10.1159/000455130",
            "pmid": "28161697",
            "title": "In the Wake of Systolic Blood Pressure Intervention Trial: New Targets for Improving Hypertension Management in Chronic Kidney Disease?",
            "year": "2017"
          },
          "matched": [
            "NCT01206062",
            "NCT03015311"
          ],
          "statusText": "OpenAlex: kept 20 records after applying the 2015+ floor"
        },
        "pubmed": {
          "anchorRecall": 1,
          "count": 20,
          "eligible": 3,
          "firstResult": {
            "doi": "10.1186/s12916-026-04678-2",
            "nctId": "NCT03527719",
            "pmid": "41776553",
            "title": "Cardiovascular outcomes of intensive blood pressure control in patients with and without metabolic dysfunction-associated fatty liver disease: post hoc analysis of the CRHCP trial.",
            "year": "2026"
          },
          "matched": [
            "NCT01206062",
            "NCT03015311",
            "NCT04993924"
          ],
          "statusText": "2273 total results (PubMed: 20)"
        }
      },
      "status": "warn",
      "topicId": "intensive_bp_elderly",
      "validationPackId": "pairwise70_cardio",
      "id": "intensive_bp_elderly",
      "pack": {
        "id": "pairwise70_cardio",
        "meta": {
          "counts": {
            "error": 0,
            "fail": 0,
            "pass": 45,
            "passRate": 100,
            "prepared": 45
          },
          "date": "2026-02-27",
          "id": "pairwise70_cardio",
          "name": "Pairwise70 Cardio End-to-End",
          "sourcePath": "validation/reports/pairwise70_cardio_benchmark/pairwise70_cardio_end_to_end_report.json",
          "summary": "45/45 prepared cardiovascular datasets passed using ClinicalTrials.gov, PubMed, and OpenAlex only, with no PDF extraction pipeline.",
          "tier": "domain",
          "verdict": "PASS"
        },
        "report_summary": {
          "scope": {
            "domain": "cardiovascular",
            "design": "RCT-focused Pairwise70 Cochrane study-level",
            "sources": [
              "ClinicalTrials.gov",
              "AACT",
              "PubMed",
              "OpenAlex"
            ],
            "pdf_pipeline_used": false
          },
          "counts": {
            "cardio_review_ids": 52,
            "cardio_dataset_files": 47,
            "prepared_datasets": 45,
            "skipped_datasets": 2,
            "pass": 45,
            "fail": 0,
            "error": 0,
            "pass_rate": 100.0
          },
          "elapsed_seconds": 9.37
        }
      }
    },
    "renal_denervation_office": {
      "category": "Hypertension",
      "extraction": {
        "ctgov": {
          "has2x2": false,
          "hasReportedEffect": false,
          "hasResults": false,
          "matchScore": 39,
          "matchedOutcome": "Trio Cohort - Median Change in Daytime Ambulatory Systolic BP",
          "recordExtract": "Trio Cohort - Median Change in Daytime Ambulatory Systolic BP | Tx --/-- vs Ctrl --/--",
          "sampleNctId": "NCT03614260",
          "success": false
        },
        "pubmed": {
          "effectCount": 0,
          "firstExtract": "",
          "pmid": "40803758",
          "success": false,
          "title": "Renal Denervation in Hypertension and Chronic Heart Failure."
        }
      },
      "failReasons": [
        "ctgov_anchor_recall",
        "ctgov_extract",
        "pubmed_extract"
      ],
      "name": "Renal denervation - Office SBP",
      "policy": {
        "allowedSources": [
          "ctgov",
          "pubmed",
          "openalex"
        ],
        "extractionMode": "pubmed-abstract-and-ctgov-records-only",
        "pass": true,
        "pdfUploadHidden": true,
        "pdfViewerHidden": true,
        "yearFloor": 2015
      },
      "screening": {
        "humanCheckable": true,
        "recordsWithAnchors": 0
      },
      "search": {
        "ctgov": {
          "anchorRecall": 0,
          "count": 6,
          "eligible": 4,
          "firstResult": {
            "nctId": "NCT02901704",
            "title": "A Prospective, Multi-centers, Randomized,Controlled, Blinded,Superiority Trial of Renal Denervation Using Iberis MultiElectrode Renal Denervation System for the Treatment of Primary Hypertension.",
            "year": "2016"
          },
          "matched": [],
          "statusText": "CT.gov: kept 6 trials after applying the 2015+ floor"
        },
        "openalex": {
          "anchorRecall": 1,
          "count": 20,
          "eligible": 4,
          "firstResult": {
            "doi": "10.1161/hypertensionaha.115.05283",
            "nctId": "NCT01656096",
            "pmid": "25824248",
            "title": "Randomized Sham-Controlled Trial of Renal Sympathetic Denervation in Mild Resistant Hypertension",
            "year": "2015"
          },
          "matched": [
            "NCT02439775",
            "NCT02439749",
            "NCT02649426",
            "NCT03614260"
          ],
          "statusText": "OpenAlex: kept 20 records after applying the 2015+ floor"
        },
        "pubmed": {
          "anchorRecall": 0.25,
          "count": 20,
          "eligible": 4,
          "firstResult": {
            "doi": "10.1136/heartjnl-2025-326186",
            "pmid": "41819559",
            "title": "Renal denervation in 2026: trial evidence, guideline recommendations and implementation strategies for clinical practice.",
            "year": "2026"
          },
          "matched": [
            "NCT02439749"
          ],
          "statusText": "2319 total results (PubMed: 20)"
        }
      },
      "status": "fail",
      "topicId": "renal_denervation_office",
      "validationPackId": "pairwise70_cardio",
      "id": "renal_denervation_office",
      "pack": {
        "id": "pairwise70_cardio",
        "meta": {
          "counts": {
            "error": 0,
            "fail": 0,
            "pass": 45,
            "passRate": 100,
            "prepared": 45
          },
          "date": "2026-02-27",
          "id": "pairwise70_cardio",
          "name": "Pairwise70 Cardio End-to-End",
          "sourcePath": "validation/reports/pairwise70_cardio_benchmark/pairwise70_cardio_end_to_end_report.json",
          "summary": "45/45 prepared cardiovascular datasets passed using ClinicalTrials.gov, PubMed, and OpenAlex only, with no PDF extraction pipeline.",
          "tier": "domain",
          "verdict": "PASS"
        },
        "report_summary": {
          "scope": {
            "domain": "cardiovascular",
            "design": "RCT-focused Pairwise70 Cochrane study-level",
            "sources": [
              "ClinicalTrials.gov",
              "AACT",
              "PubMed",
              "OpenAlex"
            ],
            "pdf_pipeline_used": false
          },
          "counts": {
            "cardio_review_ids": 52,
            "cardio_dataset_files": 47,
            "prepared_datasets": 45,
            "skipped_datasets": 2,
            "pass": 45,
            "fail": 0,
            "error": 0,
            "pass_rate": 100.0
          },
          "elapsed_seconds": 9.37
        }
      }
    },
    "renal_denervation_ambulatory": {
      "category": "Hypertension",
      "extraction": {
        "ctgov": {
          "has2x2": false,
          "hasReportedEffect": false,
          "hasResults": false,
          "matchScore": 51,
          "matchedOutcome": "Trio Cohort - Median Change in Daytime Ambulatory Systolic BP",
          "recordExtract": "Trio Cohort - Median Change in Daytime Ambulatory Systolic BP | Tx --/-- vs Ctrl --/--",
          "sampleNctId": "NCT03614260",
          "success": false
        },
        "pubmed": {
          "effectCount": 0,
          "firstExtract": "",
          "pmid": "40803758",
          "success": false,
          "title": "Renal Denervation in Hypertension and Chronic Heart Failure."
        }
      },
      "failReasons": [
        "ctgov_anchor_recall",
        "ctgov_extract",
        "pubmed_extract"
      ],
      "name": "Renal denervation - Ambulatory SBP",
      "policy": {
        "allowedSources": [
          "ctgov",
          "pubmed",
          "openalex"
        ],
        "extractionMode": "pubmed-abstract-and-ctgov-records-only",
        "pass": true,
        "pdfUploadHidden": true,
        "pdfViewerHidden": true,
        "yearFloor": 2015
      },
      "screening": {
        "humanCheckable": true,
        "recordsWithAnchors": 0
      },
      "search": {
        "ctgov": {
          "anchorRecall": 0,
          "count": 6,
          "eligible": 4,
          "firstResult": {
            "nctId": "NCT02901704",
            "title": "A Prospective, Multi-centers, Randomized,Controlled, Blinded,Superiority Trial of Renal Denervation Using Iberis MultiElectrode Renal Denervation System for the Treatment of Primary Hypertension.",
            "year": "2016"
          },
          "matched": [],
          "statusText": "CT.gov: kept 6 trials after applying the 2015+ floor"
        },
        "openalex": {
          "anchorRecall": 1,
          "count": 20,
          "eligible": 4,
          "firstResult": {
            "doi": "10.1161/hypertensionaha.115.05283",
            "nctId": "NCT01656096",
            "pmid": "25824248",
            "title": "Randomized Sham-Controlled Trial of Renal Sympathetic Denervation in Mild Resistant Hypertension",
            "year": "2015"
          },
          "matched": [
            "NCT02439775",
            "NCT02439749",
            "NCT02649426",
            "NCT03614260"
          ],
          "statusText": "OpenAlex: kept 20 records after applying the 2015+ floor"
        },
        "pubmed": {
          "anchorRecall": 0.25,
          "count": 20,
          "eligible": 4,
          "firstResult": {
            "doi": "10.1136/heartjnl-2025-326186",
            "pmid": "41819559",
            "title": "Renal denervation in 2026: trial evidence, guideline recommendations and implementation strategies for clinical practice.",
            "year": "2026"
          },
          "matched": [
            "NCT02439749"
          ],
          "statusText": "2365 total results (PubMed: 20)"
        }
      },
      "status": "fail",
      "topicId": "renal_denervation_ambulatory",
      "validationPackId": "pairwise70_cardio",
      "id": "renal_denervation_ambulatory",
      "pack": {
        "id": "pairwise70_cardio",
        "meta": {
          "counts": {
            "error": 0,
            "fail": 0,
            "pass": 45,
            "passRate": 100,
            "prepared": 45
          },
          "date": "2026-02-27",
          "id": "pairwise70_cardio",
          "name": "Pairwise70 Cardio End-to-End",
          "sourcePath": "validation/reports/pairwise70_cardio_benchmark/pairwise70_cardio_end_to_end_report.json",
          "summary": "45/45 prepared cardiovascular datasets passed using ClinicalTrials.gov, PubMed, and OpenAlex only, with no PDF extraction pipeline.",
          "tier": "domain",
          "verdict": "PASS"
        },
        "report_summary": {
          "scope": {
            "domain": "cardiovascular",
            "design": "RCT-focused Pairwise70 Cochrane study-level",
            "sources": [
              "ClinicalTrials.gov",
              "AACT",
              "PubMed",
              "OpenAlex"
            ],
            "pdf_pipeline_used": false
          },
          "counts": {
            "cardio_review_ids": 52,
            "cardio_dataset_files": 47,
            "prepared_datasets": 45,
            "skipped_datasets": 2,
            "pass": 45,
            "fail": 0,
            "error": 0,
            "pass_rate": 100.0
          },
          "elapsed_seconds": 9.37
        }
      }
    },
    "renal_denervation_medication": {
      "category": "Hypertension",
      "extraction": {
        "ctgov": {
          "has2x2": false,
          "hasReportedEffect": false,
          "hasResults": false,
          "matchScore": 27,
          "matchedOutcome": "Reduction in Average 24-hr/Night-time Ambulatory Systolic BP",
          "recordExtract": "Reduction in Average 24-hr/Night-time Ambulatory Systolic BP | Tx --/-- vs Ctrl --/--",
          "sampleNctId": "NCT03614260",
          "success": false
        },
        "pubmed": {
          "effectCount": 0,
          "firstExtract": "",
          "pmid": "40803758",
          "success": false,
          "title": "Renal Denervation in Hypertension and Chronic Heart Failure."
        }
      },
      "failReasons": [
        "ctgov_anchor_recall",
        "ctgov_extract",
        "pubmed_extract"
      ],
      "name": "Renal denervation - Medication-on background",
      "policy": {
        "allowedSources": [
          "ctgov",
          "pubmed",
          "openalex"
        ],
        "extractionMode": "pubmed-abstract-and-ctgov-records-only",
        "pass": true,
        "pdfUploadHidden": true,
        "pdfViewerHidden": true,
        "yearFloor": 2015
      },
      "screening": {
        "humanCheckable": true,
        "recordsWithAnchors": 0
      },
      "search": {
        "ctgov": {
          "anchorRecall": 0,
          "count": 6,
          "eligible": 4,
          "firstResult": {
            "nctId": "NCT02901704",
            "title": "A Prospective, Multi-centers, Randomized,Controlled, Blinded,Superiority Trial of Renal Denervation Using Iberis MultiElectrode Renal Denervation System for the Treatment of Primary Hypertension.",
            "year": "2016"
          },
          "matched": [],
          "statusText": "CT.gov: kept 6 trials after applying the 2015+ floor"
        },
        "openalex": {
          "anchorRecall": 1,
          "count": 20,
          "eligible": 4,
          "firstResult": {
            "doi": "10.1161/hypertensionaha.115.05283",
            "nctId": "NCT01656096",
            "pmid": "25824248",
            "title": "Randomized Sham-Controlled Trial of Renal Sympathetic Denervation in Mild Resistant Hypertension",
            "year": "2015"
          },
          "matched": [
            "NCT02439775",
            "NCT02439749",
            "NCT02649426",
            "NCT03614260"
          ],
          "statusText": "OpenAlex: kept 20 records after applying the 2015+ floor"
        },
        "pubmed": {
          "anchorRecall": 0.25,
          "count": 20,
          "eligible": 4,
          "firstResult": {
            "doi": "10.1136/heartjnl-2025-326186",
            "pmid": "41819559",
            "title": "Renal denervation in 2026: trial evidence, guideline recommendations and implementation strategies for clinical practice.",
            "year": "2026"
          },
          "matched": [
            "NCT02439749"
          ],
          "statusText": "2411 total results (PubMed: 20)"
        }
      },
      "status": "fail",
      "topicId": "renal_denervation_medication",
      "validationPackId": "pairwise70_cardio",
      "id": "renal_denervation_medication",
      "pack": {
        "id": "pairwise70_cardio",
        "meta": {
          "counts": {
            "error": 0,
            "fail": 0,
            "pass": 45,
            "passRate": 100,
            "prepared": 45
          },
          "date": "2026-02-27",
          "id": "pairwise70_cardio",
          "name": "Pairwise70 Cardio End-to-End",
          "sourcePath": "validation/reports/pairwise70_cardio_benchmark/pairwise70_cardio_end_to_end_report.json",
          "summary": "45/45 prepared cardiovascular datasets passed using ClinicalTrials.gov, PubMed, and OpenAlex only, with no PDF extraction pipeline.",
          "tier": "domain",
          "verdict": "PASS"
        },
        "report_summary": {
          "scope": {
            "domain": "cardiovascular",
            "design": "RCT-focused Pairwise70 Cochrane study-level",
            "sources": [
              "ClinicalTrials.gov",
              "AACT",
              "PubMed",
              "OpenAlex"
            ],
            "pdf_pipeline_used": false
          },
          "counts": {
            "cardio_review_ids": 52,
            "cardio_dataset_files": 47,
            "prepared_datasets": 45,
            "skipped_datasets": 2,
            "pass": 45,
            "fail": 0,
            "error": 0,
            "pass_rate": 100.0
          },
          "elapsed_seconds": 9.37
        }
      }
    },
    "p2y12_monotherapy_pci_mace": {
      "category": "Coronary Disease",
      "extraction": {
        "ctgov": {
          "has2x2": false,
          "hasReportedEffect": false,
          "hasResults": false,
          "matchScore": 15,
          "matchedOutcome": "Number of Participants With BARC Type 2, 3, or 5",
          "recordExtract": "Number of Participants With BARC Type 2, 3, or 5 | Tx --/-- vs Ctrl --/--",
          "sampleNctId": "NCT02494895",
          "success": false
        },
        "pubmed": {
          "effectCount": 1,
          "firstExtract": "OR 1.00, 95% CI 0.54 to 1.86",
          "pmid": "41497404",
          "success": true,
          "title": "Safety and Efficacy Comparison of Ticagrelor versus Other P2Y12 Inhibitors in Combination with Oral Anticoagulants as a Part of DAPT/SAPT in Patients with Concomitant Atrial Fibrillation and Coronary Artery Disease: A Meta-Analysis."
        }
      },
      "failReasons": [
        "ctgov_extract"
      ],
      "name": "P2Y12 monotherapy after PCI - MACE",
      "policy": {
        "allowedSources": [
          "ctgov",
          "pubmed",
          "openalex"
        ],
        "extractionMode": "pubmed-abstract-and-ctgov-records-only",
        "pass": true,
        "pdfUploadHidden": true,
        "pdfViewerHidden": true,
        "yearFloor": 2015
      },
      "screening": {
        "humanCheckable": true,
        "recordsWithAnchors": 1
      },
      "search": {
        "ctgov": {
          "anchorRecall": 0.2,
          "count": 19,
          "eligible": 5,
          "firstResult": {
            "nctId": "NCT02642419",
            "title": "Atrial Fibrillation and Ischemic Events With Rivaroxaban in Patients With Stable Coronary Artery Disease Study (AFIRE Study)",
            "year": "2015"
          },
          "matched": [
            "NCT02494895"
          ],
          "statusText": "CT.gov: kept 19 trials after applying the 2015+ floor"
        },
        "openalex": {
          "anchorRecall": 0.8,
          "count": 20,
          "eligible": 5,
          "firstResult": {
            "doi": "10.1016/j.ahj.2016.09.006",
            "title": "Ticagrelor with aspirin or alone in high-risk patients after coronary intervention: Rationale and design of the TWILIGHT study",
            "year": "2016"
          },
          "matched": [
            "NCT02079194",
            "NCT02619760",
            "NCT02270242",
            "NCT02494895"
          ],
          "statusText": "OpenAlex: kept 20 records after applying the 2015+ floor"
        },
        "pubmed": {
          "anchorRecall": 0.2,
          "count": 20,
          "eligible": 5,
          "firstResult": {
            "doi": "10.14740/cr2180",
            "pmid": "41822823",
            "title": "Assessment of No-Reflow in Patients With STEMI After Intracoronary Tirofiban After Opening of the Vessel.",
            "year": "2026"
          },
          "matched": [
            "NCT02494895"
          ],
          "statusText": "2470 total results (PubMed: 20)"
        }
      },
      "status": "warn",
      "topicId": "p2y12_monotherapy_pci_mace",
      "validationPackId": "pairwise70_cardio",
      "id": "p2y12_monotherapy_pci_mace",
      "pack": {
        "id": "pairwise70_cardio",
        "meta": {
          "counts": {
            "error": 0,
            "fail": 0,
            "pass": 45,
            "passRate": 100,
            "prepared": 45
          },
          "date": "2026-02-27",
          "id": "pairwise70_cardio",
          "name": "Pairwise70 Cardio End-to-End",
          "sourcePath": "validation/reports/pairwise70_cardio_benchmark/pairwise70_cardio_end_to_end_report.json",
          "summary": "45/45 prepared cardiovascular datasets passed using ClinicalTrials.gov, PubMed, and OpenAlex only, with no PDF extraction pipeline.",
          "tier": "domain",
          "verdict": "PASS"
        },
        "report_summary": {
          "scope": {
            "domain": "cardiovascular",
            "design": "RCT-focused Pairwise70 Cochrane study-level",
            "sources": [
              "ClinicalTrials.gov",
              "AACT",
              "PubMed",
              "OpenAlex"
            ],
            "pdf_pipeline_used": false
          },
          "counts": {
            "cardio_review_ids": 52,
            "cardio_dataset_files": 47,
            "prepared_datasets": 45,
            "skipped_datasets": 2,
            "pass": 45,
            "fail": 0,
            "error": 0,
            "pass_rate": 100.0
          },
          "elapsed_seconds": 9.37
        }
      }
    },
    "p2y12_monotherapy_pci_bleeding": {
      "category": "Coronary Disease",
      "extraction": {
        "ctgov": {
          "has2x2": false,
          "hasReportedEffect": false,
          "hasResults": false,
          "matchScore": 15,
          "matchedOutcome": "Number of Participants With BARC Type 2, 3, or 5",
          "recordExtract": "Number of Participants With BARC Type 2, 3, or 5 | Tx --/-- vs Ctrl --/--",
          "sampleNctId": "NCT02494895",
          "success": false
        },
        "pubmed": {
          "effectCount": 1,
          "firstExtract": "OR 1.00, 95% CI 0.54 to 1.86",
          "pmid": "41497404",
          "success": true,
          "title": "Safety and Efficacy Comparison of Ticagrelor versus Other P2Y12 Inhibitors in Combination with Oral Anticoagulants as a Part of DAPT/SAPT in Patients with Concomitant Atrial Fibrillation and Coronary Artery Disease: A Meta-Analysis."
        }
      },
      "failReasons": [
        "ctgov_extract"
      ],
      "name": "P2Y12 monotherapy after PCI - Bleeding",
      "policy": {
        "allowedSources": [
          "ctgov",
          "pubmed",
          "openalex"
        ],
        "extractionMode": "pubmed-abstract-and-ctgov-records-only",
        "pass": true,
        "pdfUploadHidden": true,
        "pdfViewerHidden": true,
        "yearFloor": 2015
      },
      "screening": {
        "humanCheckable": true,
        "recordsWithAnchors": 1
      },
      "search": {
        "ctgov": {
          "anchorRecall": 0.2,
          "count": 19,
          "eligible": 5,
          "firstResult": {
            "nctId": "NCT02642419",
            "title": "Atrial Fibrillation and Ischemic Events With Rivaroxaban in Patients With Stable Coronary Artery Disease Study (AFIRE Study)",
            "year": "2015"
          },
          "matched": [
            "NCT02494895"
          ],
          "statusText": "CT.gov: kept 19 trials after applying the 2015+ floor"
        },
        "openalex": {
          "anchorRecall": 0.8,
          "count": 20,
          "eligible": 5,
          "firstResult": {
            "doi": "10.1016/j.ahj.2016.09.006",
            "title": "Ticagrelor with aspirin or alone in high-risk patients after coronary intervention: Rationale and design of the TWILIGHT study",
            "year": "2016"
          },
          "matched": [
            "NCT02079194",
            "NCT02619760",
            "NCT02270242",
            "NCT02494895"
          ],
          "statusText": "OpenAlex: kept 20 records after applying the 2015+ floor"
        },
        "pubmed": {
          "anchorRecall": 0.2,
          "count": 20,
          "eligible": 5,
          "firstResult": {
            "doi": "10.14740/cr2180",
            "pmid": "41822823",
            "title": "Assessment of No-Reflow in Patients With STEMI After Intracoronary Tirofiban After Opening of the Vessel.",
            "year": "2026"
          },
          "matched": [
            "NCT02494895"
          ],
          "statusText": "2529 total results (PubMed: 20)"
        }
      },
      "status": "warn",
      "topicId": "p2y12_monotherapy_pci_bleeding",
      "validationPackId": "pairwise70_cardio",
      "id": "p2y12_monotherapy_pci_bleeding",
      "pack": {
        "id": "pairwise70_cardio",
        "meta": {
          "counts": {
            "error": 0,
            "fail": 0,
            "pass": 45,
            "passRate": 100,
            "prepared": 45
          },
          "date": "2026-02-27",
          "id": "pairwise70_cardio",
          "name": "Pairwise70 Cardio End-to-End",
          "sourcePath": "validation/reports/pairwise70_cardio_benchmark/pairwise70_cardio_end_to_end_report.json",
          "summary": "45/45 prepared cardiovascular datasets passed using ClinicalTrials.gov, PubMed, and OpenAlex only, with no PDF extraction pipeline.",
          "tier": "domain",
          "verdict": "PASS"
        },
        "report_summary": {
          "scope": {
            "domain": "cardiovascular",
            "design": "RCT-focused Pairwise70 Cochrane study-level",
            "sources": [
              "ClinicalTrials.gov",
              "AACT",
              "PubMed",
              "OpenAlex"
            ],
            "pdf_pipeline_used": false
          },
          "counts": {
            "cardio_review_ids": 52,
            "cardio_dataset_files": 47,
            "prepared_datasets": 45,
            "skipped_datasets": 2,
            "pass": 45,
            "fail": 0,
            "error": 0,
            "pass_rate": 100.0
          },
          "elapsed_seconds": 9.37
        }
      }
    },
    "p2y12_monotherapy_pci_acs": {
      "category": "Coronary Disease",
      "extraction": {
        "ctgov": {
          "has2x2": false,
          "hasReportedEffect": false,
          "hasResults": false,
          "matchScore": 15,
          "matchedOutcome": "Number of Participants With BARC Type 2, 3, or 5",
          "recordExtract": "Number of Participants With BARC Type 2, 3, or 5 | Tx --/-- vs Ctrl --/--",
          "sampleNctId": "NCT02494895",
          "success": false
        },
        "pubmed": {
          "effectCount": 1,
          "firstExtract": "OR 1.00, 95% CI 0.54 to 1.86",
          "pmid": "41497404",
          "success": true,
          "title": "Safety and Efficacy Comparison of Ticagrelor versus Other P2Y12 Inhibitors in Combination with Oral Anticoagulants as a Part of DAPT/SAPT in Patients with Concomitant Atrial Fibrillation and Coronary Artery Disease: A Meta-Analysis."
        }
      },
      "failReasons": [
        "ctgov_extract"
      ],
      "name": "P2Y12 monotherapy after PCI - ACS subgroup",
      "policy": {
        "allowedSources": [
          "ctgov",
          "pubmed",
          "openalex"
        ],
        "extractionMode": "pubmed-abstract-and-ctgov-records-only",
        "pass": true,
        "pdfUploadHidden": true,
        "pdfViewerHidden": true,
        "yearFloor": 2015
      },
      "screening": {
        "humanCheckable": true,
        "recordsWithAnchors": 1
      },
      "search": {
        "ctgov": {
          "anchorRecall": 0.2,
          "count": 19,
          "eligible": 5,
          "firstResult": {
            "nctId": "NCT02642419",
            "title": "Atrial Fibrillation and Ischemic Events With Rivaroxaban in Patients With Stable Coronary Artery Disease Study (AFIRE Study)",
            "year": "2015"
          },
          "matched": [
            "NCT02494895"
          ],
          "statusText": "CT.gov: kept 19 trials after applying the 2015+ floor"
        },
        "openalex": {
          "anchorRecall": 0.8,
          "count": 20,
          "eligible": 5,
          "firstResult": {
            "doi": "10.1016/j.ahj.2016.09.006",
            "title": "Ticagrelor with aspirin or alone in high-risk patients after coronary intervention: Rationale and design of the TWILIGHT study",
            "year": "2016"
          },
          "matched": [
            "NCT02079194",
            "NCT02619760",
            "NCT02270242",
            "NCT02494895"
          ],
          "statusText": "OpenAlex: kept 20 records after applying the 2015+ floor"
        },
        "pubmed": {
          "anchorRecall": 0.2,
          "count": 20,
          "eligible": 5,
          "firstResult": {
            "doi": "10.14740/cr2180",
            "pmid": "41822823",
            "title": "Assessment of No-Reflow in Patients With STEMI After Intracoronary Tirofiban After Opening of the Vessel.",
            "year": "2026"
          },
          "matched": [
            "NCT02494895"
          ],
          "statusText": "2588 total results (PubMed: 20)"
        }
      },
      "status": "warn",
      "topicId": "p2y12_monotherapy_pci_acs",
      "validationPackId": "pairwise70_cardio",
      "id": "p2y12_monotherapy_pci_acs",
      "pack": {
        "id": "pairwise70_cardio",
        "meta": {
          "counts": {
            "error": 0,
            "fail": 0,
            "pass": 45,
            "passRate": 100,
            "prepared": 45
          },
          "date": "2026-02-27",
          "id": "pairwise70_cardio",
          "name": "Pairwise70 Cardio End-to-End",
          "sourcePath": "validation/reports/pairwise70_cardio_benchmark/pairwise70_cardio_end_to_end_report.json",
          "summary": "45/45 prepared cardiovascular datasets passed using ClinicalTrials.gov, PubMed, and OpenAlex only, with no PDF extraction pipeline.",
          "tier": "domain",
          "verdict": "PASS"
        },
        "report_summary": {
          "scope": {
            "domain": "cardiovascular",
            "design": "RCT-focused Pairwise70 Cochrane study-level",
            "sources": [
              "ClinicalTrials.gov",
              "AACT",
              "PubMed",
              "OpenAlex"
            ],
            "pdf_pipeline_used": false
          },
          "counts": {
            "cardio_review_ids": 52,
            "cardio_dataset_files": 47,
            "prepared_datasets": 45,
            "skipped_datasets": 2,
            "pass": 45,
            "fail": 0,
            "error": 0,
            "pass_rate": 100.0
          },
          "elapsed_seconds": 9.37
        }
      }
    },
    "short_dapt_pci_mace": {
      "category": "Coronary Disease",
      "extraction": {
        "ctgov": {
          "has2x2": false,
          "hasReportedEffect": false,
          "hasResults": false,
          "matchScore": null,
          "matchedOutcome": "",
          "recordExtract": "",
          "sampleNctId": "NCT03462498",
          "success": false
        },
        "pubmed": {
          "effectCount": 2,
          "firstExtract": "RR: 1.57; 95% CI: 1.06-2.34",
          "pmid": "41760043",
          "success": true,
          "title": "Antiplatelet dilemma: Clopidogrel or aspirin for long-term cardiovascular protection after dual antiplatelet therapy following PCI."
        }
      },
      "failReasons": [
        "ctgov_extract"
      ],
      "name": "Short DAPT after PCI - MACE",
      "policy": {
        "allowedSources": [
          "ctgov",
          "pubmed",
          "openalex"
        ],
        "extractionMode": "pubmed-abstract-and-ctgov-records-only",
        "pass": true,
        "pdfUploadHidden": true,
        "pdfViewerHidden": true,
        "yearFloor": 2015
      },
      "screening": {
        "humanCheckable": true,
        "recordsWithAnchors": 1
      },
      "search": {
        "ctgov": {
          "anchorRecall": 0.3333333333333333,
          "count": 15,
          "eligible": 3,
          "firstResult": {
            "nctId": "NCT02642419",
            "title": "Atrial Fibrillation and Ischemic Events With Rivaroxaban in Patients With Stable Coronary Artery Disease Study (AFIRE Study)",
            "year": "2015"
          },
          "matched": [
            "NCT02658955"
          ],
          "statusText": "CT.gov: kept 15 trials after applying the 2015+ floor"
        },
        "openalex": {
          "anchorRecall": 0.3333333333333333,
          "count": 20,
          "eligible": 3,
          "firstResult": {
            "doi": "10.1093/eurheartj/ehv320",
            "pmid": "22395108",
            "title": "2015 ESC Guidelines for the management of acute coronary syndromes in patients presenting without persistent ST-segment elevation",
            "year": "2015"
          },
          "matched": [
            "NCT02658955"
          ],
          "statusText": "OpenAlex: kept 20 records after applying the 2015+ floor"
        },
        "pubmed": {
          "anchorRecall": 0,
          "count": 20,
          "eligible": 3,
          "firstResult": {
            "doi": "10.3389/fcvm.2026.1731952",
            "pmid": "41815903",
            "title": "Drug-coated balloons in complex large-vessel coronary artery disease: a comprehensive review of current evidence and future perspectives.",
            "year": "2026"
          },
          "matched": [],
          "statusText": "2643 total results (PubMed: 20)"
        }
      },
      "status": "warn",
      "topicId": "short_dapt_pci_mace",
      "validationPackId": "pairwise70_cardio",
      "id": "short_dapt_pci_mace",
      "pack": {
        "id": "pairwise70_cardio",
        "meta": {
          "counts": {
            "error": 0,
            "fail": 0,
            "pass": 45,
            "passRate": 100,
            "prepared": 45
          },
          "date": "2026-02-27",
          "id": "pairwise70_cardio",
          "name": "Pairwise70 Cardio End-to-End",
          "sourcePath": "validation/reports/pairwise70_cardio_benchmark/pairwise70_cardio_end_to_end_report.json",
          "summary": "45/45 prepared cardiovascular datasets passed using ClinicalTrials.gov, PubMed, and OpenAlex only, with no PDF extraction pipeline.",
          "tier": "domain",
          "verdict": "PASS"
        },
        "report_summary": {
          "scope": {
            "domain": "cardiovascular",
            "design": "RCT-focused Pairwise70 Cochrane study-level",
            "sources": [
              "ClinicalTrials.gov",
              "AACT",
              "PubMed",
              "OpenAlex"
            ],
            "pdf_pipeline_used": false
          },
          "counts": {
            "cardio_review_ids": 52,
            "cardio_dataset_files": 47,
            "prepared_datasets": 45,
            "skipped_datasets": 2,
            "pass": 45,
            "fail": 0,
            "error": 0,
            "pass_rate": 100.0
          },
          "elapsed_seconds": 9.37
        }
      }
    },
    "short_dapt_pci_bleeding": {
      "category": "Coronary Disease",
      "extraction": {
        "ctgov": {
          "has2x2": false,
          "hasReportedEffect": false,
          "hasResults": false,
          "matchScore": null,
          "matchedOutcome": "",
          "recordExtract": "",
          "sampleNctId": "NCT03462498",
          "success": false
        },
        "pubmed": {
          "effectCount": 2,
          "firstExtract": "RR: 1.57; 95% CI: 1.06-2.34",
          "pmid": "41760043",
          "success": true,
          "title": "Antiplatelet dilemma: Clopidogrel or aspirin for long-term cardiovascular protection after dual antiplatelet therapy following PCI."
        }
      },
      "failReasons": [
        "ctgov_extract"
      ],
      "name": "Short DAPT after PCI - Bleeding",
      "policy": {
        "allowedSources": [
          "ctgov",
          "pubmed",
          "openalex"
        ],
        "extractionMode": "pubmed-abstract-and-ctgov-records-only",
        "pass": true,
        "pdfUploadHidden": true,
        "pdfViewerHidden": true,
        "yearFloor": 2015
      },
      "screening": {
        "humanCheckable": true,
        "recordsWithAnchors": 1
      },
      "search": {
        "ctgov": {
          "anchorRecall": 0.3333333333333333,
          "count": 15,
          "eligible": 3,
          "firstResult": {
            "nctId": "NCT02642419",
            "title": "Atrial Fibrillation and Ischemic Events With Rivaroxaban in Patients With Stable Coronary Artery Disease Study (AFIRE Study)",
            "year": "2015"
          },
          "matched": [
            "NCT02658955"
          ],
          "statusText": "CT.gov: kept 15 trials after applying the 2015+ floor"
        },
        "openalex": {
          "anchorRecall": 0.3333333333333333,
          "count": 20,
          "eligible": 3,
          "firstResult": {
            "doi": "10.1093/eurheartj/ehv320",
            "pmid": "22395108",
            "title": "2015 ESC Guidelines for the management of acute coronary syndromes in patients presenting without persistent ST-segment elevation",
            "year": "2015"
          },
          "matched": [
            "NCT02658955"
          ],
          "statusText": "OpenAlex: kept 20 records after applying the 2015+ floor"
        },
        "pubmed": {
          "anchorRecall": 0,
          "count": 20,
          "eligible": 3,
          "firstResult": {
            "doi": "10.3389/fcvm.2026.1731952",
            "pmid": "41815903",
            "title": "Drug-coated balloons in complex large-vessel coronary artery disease: a comprehensive review of current evidence and future perspectives.",
            "year": "2026"
          },
          "matched": [],
          "statusText": "2698 total results (PubMed: 20)"
        }
      },
      "status": "warn",
      "topicId": "short_dapt_pci_bleeding",
      "validationPackId": "pairwise70_cardio",
      "id": "short_dapt_pci_bleeding",
      "pack": {
        "id": "pairwise70_cardio",
        "meta": {
          "counts": {
            "error": 0,
            "fail": 0,
            "pass": 45,
            "passRate": 100,
            "prepared": 45
          },
          "date": "2026-02-27",
          "id": "pairwise70_cardio",
          "name": "Pairwise70 Cardio End-to-End",
          "sourcePath": "validation/reports/pairwise70_cardio_benchmark/pairwise70_cardio_end_to_end_report.json",
          "summary": "45/45 prepared cardiovascular datasets passed using ClinicalTrials.gov, PubMed, and OpenAlex only, with no PDF extraction pipeline.",
          "tier": "domain",
          "verdict": "PASS"
        },
        "report_summary": {
          "scope": {
            "domain": "cardiovascular",
            "design": "RCT-focused Pairwise70 Cochrane study-level",
            "sources": [
              "ClinicalTrials.gov",
              "AACT",
              "PubMed",
              "OpenAlex"
            ],
            "pdf_pipeline_used": false
          },
          "counts": {
            "cardio_review_ids": 52,
            "cardio_dataset_files": 47,
            "prepared_datasets": 45,
            "skipped_datasets": 2,
            "pass": 45,
            "fail": 0,
            "error": 0,
            "pass_rate": 100.0
          },
          "elapsed_seconds": 9.37
        }
      }
    },
    "short_dapt_pci_high_bleeding_risk": {
      "category": "Coronary Disease",
      "extraction": {
        "ctgov": {
          "has2x2": false,
          "hasReportedEffect": false,
          "hasResults": false,
          "matchScore": null,
          "matchedOutcome": "",
          "recordExtract": "",
          "sampleNctId": "NCT03462498",
          "success": false
        },
        "pubmed": {
          "effectCount": 2,
          "firstExtract": "RR: 1.57; 95% CI: 1.06-2.34",
          "pmid": "41760043",
          "success": true,
          "title": "Antiplatelet dilemma: Clopidogrel or aspirin for long-term cardiovascular protection after dual antiplatelet therapy following PCI."
        }
      },
      "failReasons": [
        "ctgov_extract"
      ],
      "name": "Short DAPT after PCI - High bleeding risk",
      "policy": {
        "allowedSources": [
          "ctgov",
          "pubmed",
          "openalex"
        ],
        "extractionMode": "pubmed-abstract-and-ctgov-records-only",
        "pass": true,
        "pdfUploadHidden": true,
        "pdfViewerHidden": true,
        "yearFloor": 2015
      },
      "screening": {
        "humanCheckable": true,
        "recordsWithAnchors": 1
      },
      "search": {
        "ctgov": {
          "anchorRecall": 0.3333333333333333,
          "count": 15,
          "eligible": 3,
          "firstResult": {
            "nctId": "NCT02642419",
            "title": "Atrial Fibrillation and Ischemic Events With Rivaroxaban in Patients With Stable Coronary Artery Disease Study (AFIRE Study)",
            "year": "2015"
          },
          "matched": [
            "NCT02658955"
          ],
          "statusText": "CT.gov: kept 15 trials after applying the 2015+ floor"
        },
        "openalex": {
          "anchorRecall": 0.3333333333333333,
          "count": 20,
          "eligible": 3,
          "firstResult": {
            "doi": "10.1093/eurheartj/ehv320",
            "pmid": "22395108",
            "title": "2015 ESC Guidelines for the management of acute coronary syndromes in patients presenting without persistent ST-segment elevation",
            "year": "2015"
          },
          "matched": [
            "NCT02658955"
          ],
          "statusText": "OpenAlex: kept 20 records after applying the 2015+ floor"
        },
        "pubmed": {
          "anchorRecall": 0,
          "count": 20,
          "eligible": 3,
          "firstResult": {
            "doi": "10.3389/fcvm.2026.1731952",
            "pmid": "41815903",
            "title": "Drug-coated balloons in complex large-vessel coronary artery disease: a comprehensive review of current evidence and future perspectives.",
            "year": "2026"
          },
          "matched": [],
          "statusText": "2753 total results (PubMed: 20)"
        }
      },
      "status": "warn",
      "topicId": "short_dapt_pci_high_bleeding_risk",
      "validationPackId": "pairwise70_cardio",
      "id": "short_dapt_pci_high_bleeding_risk",
      "pack": {
        "id": "pairwise70_cardio",
        "meta": {
          "counts": {
            "error": 0,
            "fail": 0,
            "pass": 45,
            "passRate": 100,
            "prepared": 45
          },
          "date": "2026-02-27",
          "id": "pairwise70_cardio",
          "name": "Pairwise70 Cardio End-to-End",
          "sourcePath": "validation/reports/pairwise70_cardio_benchmark/pairwise70_cardio_end_to_end_report.json",
          "summary": "45/45 prepared cardiovascular datasets passed using ClinicalTrials.gov, PubMed, and OpenAlex only, with no PDF extraction pipeline.",
          "tier": "domain",
          "verdict": "PASS"
        },
        "report_summary": {
          "scope": {
            "domain": "cardiovascular",
            "design": "RCT-focused Pairwise70 Cochrane study-level",
            "sources": [
              "ClinicalTrials.gov",
              "AACT",
              "PubMed",
              "OpenAlex"
            ],
            "pdf_pipeline_used": false
          },
          "counts": {
            "cardio_review_ids": 52,
            "cardio_dataset_files": 47,
            "prepared_datasets": 45,
            "skipped_datasets": 2,
            "pass": 45,
            "fail": 0,
            "error": 0,
            "pass_rate": 100.0
          },
          "elapsed_seconds": 9.37
        }
      }
    },
    "af_pci_dual_therapy_bleeding": {
      "category": "Atrial Fibrillation",
      "extraction": {
        "ctgov": {
          "has2x2": false,
          "hasReportedEffect": false,
          "hasResults": true,
          "matchScore": 63,
          "matchedOutcome": "Number of Participants With Adjudicated Major or Clinically Relevant Non-major Bleeding As First Event Defined by International Society on Thrombosis and Haemostasis Following Edoxaban-based Regimen Compared With Vitamin K Antagonist (VKA)-Based Regimen",
          "recordExtract": "Number of Participants With Adjudicated Major or Clinically Relevant Non-major Bleeding As First Event Defined by International Society on Thrombosis and Haemostasis Following Edoxaban-based Regimen Compared With Vitamin K Antagonist (VKA)-Based Regimen | Tx --/-- vs Ctrl --/--",
          "sampleNctId": "NCT02866175",
          "success": false
        },
        "pubmed": {
          "effectCount": 3,
          "firstExtract": "RR: 0.83; 95% CI: 0.58-1.20",
          "pmid": "39918467",
          "success": true,
          "title": "Antithrombotic Therapy to Minimize\u00a0Total Events After ACS\u00a0or\u00a0PCI\u00a0in\u00a0Atrial Fibrillation: Insights From AUGUSTUS."
        }
      },
      "failReasons": [
        "ctgov_extract"
      ],
      "name": "DOAC-based dual therapy in AF-PCI - Bleeding",
      "policy": {
        "allowedSources": [
          "ctgov",
          "pubmed",
          "openalex"
        ],
        "extractionMode": "pubmed-abstract-and-ctgov-records-only",
        "pass": true,
        "pdfUploadHidden": true,
        "pdfViewerHidden": true,
        "yearFloor": 2015
      },
      "screening": {
        "humanCheckable": true,
        "recordsWithAnchors": 3
      },
      "search": {
        "ctgov": {
          "anchorRecall": 0.75,
          "count": 16,
          "eligible": 4,
          "firstResult": {
            "nctId": "NCT04151680",
            "title": "Safety and Efficacy of Anticoagulation on Demand After Percutaneous Coronary Intervention in High Bleeding Risk (HBR) Patients With History of Paroxysmal Atrial Fibrillation",
            "year": "2019"
          },
          "matched": [
            "NCT02164864",
            "NCT02415400",
            "NCT02866175"
          ],
          "statusText": "CT.gov: kept 16 trials after applying the 2015+ floor"
        },
        "openalex": {
          "anchorRecall": 0,
          "count": 20,
          "eligible": 4,
          "firstResult": {
            "doi": "10.1161/cir.0000000000001193",
            "pmid": "38033089",
            "title": "2023 ACC/AHA/ACCP/HRS Guideline for the Diagnosis and Management of Atrial Fibrillation: A Report of the American College of Cardiology/American Heart Association Joint Committee on Clinical Practice Guidelines",
            "year": "2023"
          },
          "matched": [],
          "statusText": "OpenAlex: kept 20 records after applying the 2015+ floor"
        },
        "pubmed": {
          "anchorRecall": 0.25,
          "count": 20,
          "eligible": 4,
          "firstResult": {
            "doi": "10.1186/s12916-025-04477-1",
            "nctId": "NCT03536611",
            "pmid": "41254594",
            "title": "Dabigatran-based versus warfarin-based triple antithrombotic regimen with a 1-month intensification after coronary stenting in patients with nonvalvular atrial fibrillation (COACH-AF PCI).",
            "year": "2025"
          },
          "matched": [
            "NCT02415400"
          ],
          "statusText": "2809 total results (PubMed: 20)"
        }
      },
      "status": "warn",
      "topicId": "af_pci_dual_therapy_bleeding",
      "validationPackId": "pairwise70_cardio",
      "id": "af_pci_dual_therapy_bleeding",
      "pack": {
        "id": "pairwise70_cardio",
        "meta": {
          "counts": {
            "error": 0,
            "fail": 0,
            "pass": 45,
            "passRate": 100,
            "prepared": 45
          },
          "date": "2026-02-27",
          "id": "pairwise70_cardio",
          "name": "Pairwise70 Cardio End-to-End",
          "sourcePath": "validation/reports/pairwise70_cardio_benchmark/pairwise70_cardio_end_to_end_report.json",
          "summary": "45/45 prepared cardiovascular datasets passed using ClinicalTrials.gov, PubMed, and OpenAlex only, with no PDF extraction pipeline.",
          "tier": "domain",
          "verdict": "PASS"
        },
        "report_summary": {
          "scope": {
            "domain": "cardiovascular",
            "design": "RCT-focused Pairwise70 Cochrane study-level",
            "sources": [
              "ClinicalTrials.gov",
              "AACT",
              "PubMed",
              "OpenAlex"
            ],
            "pdf_pipeline_used": false
          },
          "counts": {
            "cardio_review_ids": 52,
            "cardio_dataset_files": 47,
            "prepared_datasets": 45,
            "skipped_datasets": 2,
            "pass": 45,
            "fail": 0,
            "error": 0,
            "pass_rate": 100.0
          },
          "elapsed_seconds": 9.37
        }
      }
    },
    "af_pci_dual_therapy_ischemic": {
      "category": "Atrial Fibrillation",
      "extraction": {
        "ctgov": {
          "has2x2": false,
          "hasReportedEffect": false,
          "hasResults": true,
          "matchScore": 45,
          "matchedOutcome": "Number of Participants With Adjudicated Major, Minor, and Minimal Bleeding by Thrombolysis in Myocardial Infarction (TIMI) Definition Following Edoxaban-based Regimen Compared With Vitamin K Antagonist (VKA)-Based Regimen",
          "recordExtract": "Number of Participants With Adjudicated Major, Minor, and Minimal Bleeding by Thrombolysis in Myocardial Infarction (TIMI) Definition Following Edoxaban-based Regimen Compared With Vitamin K Antagonist (VKA)-Based Regimen | Tx --/-- vs Ctrl --/--",
          "sampleNctId": "NCT02866175",
          "success": false
        },
        "pubmed": {
          "effectCount": 3,
          "firstExtract": "RR: 0.83; 95% CI: 0.58-1.20",
          "pmid": "39918467",
          "success": true,
          "title": "Antithrombotic Therapy to Minimize\u00a0Total Events After ACS\u00a0or\u00a0PCI\u00a0in\u00a0Atrial Fibrillation: Insights From AUGUSTUS."
        }
      },
      "failReasons": [
        "ctgov_extract"
      ],
      "name": "DOAC-based dual therapy in AF-PCI - Ischemic events",
      "policy": {
        "allowedSources": [
          "ctgov",
          "pubmed",
          "openalex"
        ],
        "extractionMode": "pubmed-abstract-and-ctgov-records-only",
        "pass": true,
        "pdfUploadHidden": true,
        "pdfViewerHidden": true,
        "yearFloor": 2015
      },
      "screening": {
        "humanCheckable": true,
        "recordsWithAnchors": 3
      },
      "search": {
        "ctgov": {
          "anchorRecall": 0.75,
          "count": 16,
          "eligible": 4,
          "firstResult": {
            "nctId": "NCT04151680",
            "title": "Safety and Efficacy of Anticoagulation on Demand After Percutaneous Coronary Intervention in High Bleeding Risk (HBR) Patients With History of Paroxysmal Atrial Fibrillation",
            "year": "2019"
          },
          "matched": [
            "NCT02164864",
            "NCT02415400",
            "NCT02866175"
          ],
          "statusText": "CT.gov: kept 16 trials after applying the 2015+ floor"
        },
        "openalex": {
          "anchorRecall": 0,
          "count": 20,
          "eligible": 4,
          "firstResult": {
            "doi": "10.1161/cir.0000000000001193",
            "pmid": "38033089",
            "title": "2023 ACC/AHA/ACCP/HRS Guideline for the Diagnosis and Management of Atrial Fibrillation: A Report of the American College of Cardiology/American Heart Association Joint Committee on Clinical Practice Guidelines",
            "year": "2023"
          },
          "matched": [],
          "statusText": "OpenAlex: kept 20 records after applying the 2015+ floor"
        },
        "pubmed": {
          "anchorRecall": 0.25,
          "count": 20,
          "eligible": 4,
          "firstResult": {
            "doi": "10.1186/s12916-025-04477-1",
            "nctId": "NCT03536611",
            "pmid": "41254594",
            "title": "Dabigatran-based versus warfarin-based triple antithrombotic regimen with a 1-month intensification after coronary stenting in patients with nonvalvular atrial fibrillation (COACH-AF PCI).",
            "year": "2025"
          },
          "matched": [
            "NCT02415400"
          ],
          "statusText": "2865 total results (PubMed: 20)"
        }
      },
      "status": "warn",
      "topicId": "af_pci_dual_therapy_ischemic",
      "validationPackId": "pairwise70_cardio",
      "id": "af_pci_dual_therapy_ischemic",
      "pack": {
        "id": "pairwise70_cardio",
        "meta": {
          "counts": {
            "error": 0,
            "fail": 0,
            "pass": 45,
            "passRate": 100,
            "prepared": 45
          },
          "date": "2026-02-27",
          "id": "pairwise70_cardio",
          "name": "Pairwise70 Cardio End-to-End",
          "sourcePath": "validation/reports/pairwise70_cardio_benchmark/pairwise70_cardio_end_to_end_report.json",
          "summary": "45/45 prepared cardiovascular datasets passed using ClinicalTrials.gov, PubMed, and OpenAlex only, with no PDF extraction pipeline.",
          "tier": "domain",
          "verdict": "PASS"
        },
        "report_summary": {
          "scope": {
            "domain": "cardiovascular",
            "design": "RCT-focused Pairwise70 Cochrane study-level",
            "sources": [
              "ClinicalTrials.gov",
              "AACT",
              "PubMed",
              "OpenAlex"
            ],
            "pdf_pipeline_used": false
          },
          "counts": {
            "cardio_review_ids": 52,
            "cardio_dataset_files": 47,
            "prepared_datasets": 45,
            "skipped_datasets": 2,
            "pass": 45,
            "fail": 0,
            "error": 0,
            "pass_rate": 100.0
          },
          "elapsed_seconds": 9.37
        }
      }
    },
    "af_pci_dual_therapy_mortality": {
      "category": "Atrial Fibrillation",
      "extraction": {
        "ctgov": {
          "has2x2": false,
          "hasReportedEffect": false,
          "hasResults": true,
          "matchScore": 15,
          "matchedOutcome": "Number of Participants With Adjudicated Major or Clinically Relevant Non-major Bleeding As First Event Defined by International Society on Thrombosis and Haemostasis Following Edoxaban-based Regimen Compared With Vitamin K Antagonist (VKA)-Based Regimen",
          "recordExtract": "Number of Participants With Adjudicated Major or Clinically Relevant Non-major Bleeding As First Event Defined by International Society on Thrombosis and Haemostasis Following Edoxaban-based Regimen Compared With Vitamin K Antagonist (VKA)-Based Regimen | Tx --/-- vs Ctrl --/--",
          "sampleNctId": "NCT02866175",
          "success": false
        },
        "pubmed": {
          "effectCount": 3,
          "firstExtract": "RR: 0.83; 95% CI: 0.58-1.20",
          "pmid": "39918467",
          "success": true,
          "title": "Antithrombotic Therapy to Minimize\u00a0Total Events After ACS\u00a0or\u00a0PCI\u00a0in\u00a0Atrial Fibrillation: Insights From AUGUSTUS."
        }
      },
      "failReasons": [
        "ctgov_extract"
      ],
      "name": "DOAC-based dual therapy in AF-PCI - All-cause mortality",
      "policy": {
        "allowedSources": [
          "ctgov",
          "pubmed",
          "openalex"
        ],
        "extractionMode": "pubmed-abstract-and-ctgov-records-only",
        "pass": true,
        "pdfUploadHidden": true,
        "pdfViewerHidden": true,
        "yearFloor": 2015
      },
      "screening": {
        "humanCheckable": true,
        "recordsWithAnchors": 3
      },
      "search": {
        "ctgov": {
          "anchorRecall": 0.75,
          "count": 16,
          "eligible": 4,
          "firstResult": {
            "nctId": "NCT04151680",
            "title": "Safety and Efficacy of Anticoagulation on Demand After Percutaneous Coronary Intervention in High Bleeding Risk (HBR) Patients With History of Paroxysmal Atrial Fibrillation",
            "year": "2019"
          },
          "matched": [
            "NCT02164864",
            "NCT02415400",
            "NCT02866175"
          ],
          "statusText": "CT.gov: kept 16 trials after applying the 2015+ floor"
        },
        "openalex": {
          "anchorRecall": 0,
          "count": 20,
          "eligible": 4,
          "firstResult": {
            "doi": "10.1161/cir.0000000000001193",
            "pmid": "38033089",
            "title": "2023 ACC/AHA/ACCP/HRS Guideline for the Diagnosis and Management of Atrial Fibrillation: A Report of the American College of Cardiology/American Heart Association Joint Committee on Clinical Practice Guidelines",
            "year": "2023"
          },
          "matched": [],
          "statusText": "OpenAlex: kept 20 records after applying the 2015+ floor"
        },
        "pubmed": {
          "anchorRecall": 0.25,
          "count": 20,
          "eligible": 4,
          "firstResult": {
            "doi": "10.1186/s12916-025-04477-1",
            "nctId": "NCT03536611",
            "pmid": "41254594",
            "title": "Dabigatran-based versus warfarin-based triple antithrombotic regimen with a 1-month intensification after coronary stenting in patients with nonvalvular atrial fibrillation (COACH-AF PCI).",
            "year": "2025"
          },
          "matched": [
            "NCT02415400"
          ],
          "statusText": "2921 total results (PubMed: 20)"
        }
      },
      "status": "warn",
      "topicId": "af_pci_dual_therapy_mortality",
      "validationPackId": "pairwise70_cardio",
      "id": "af_pci_dual_therapy_mortality",
      "pack": {
        "id": "pairwise70_cardio",
        "meta": {
          "counts": {
            "error": 0,
            "fail": 0,
            "pass": 45,
            "passRate": 100,
            "prepared": 45
          },
          "date": "2026-02-27",
          "id": "pairwise70_cardio",
          "name": "Pairwise70 Cardio End-to-End",
          "sourcePath": "validation/reports/pairwise70_cardio_benchmark/pairwise70_cardio_end_to_end_report.json",
          "summary": "45/45 prepared cardiovascular datasets passed using ClinicalTrials.gov, PubMed, and OpenAlex only, with no PDF extraction pipeline.",
          "tier": "domain",
          "verdict": "PASS"
        },
        "report_summary": {
          "scope": {
            "domain": "cardiovascular",
            "design": "RCT-focused Pairwise70 Cochrane study-level",
            "sources": [
              "ClinicalTrials.gov",
              "AACT",
              "PubMed",
              "OpenAlex"
            ],
            "pdf_pipeline_used": false
          },
          "counts": {
            "cardio_review_ids": 52,
            "cardio_dataset_files": 47,
            "prepared_datasets": 45,
            "skipped_datasets": 2,
            "pass": 45,
            "fail": 0,
            "error": 0,
            "pass_rate": 100.0
          },
          "elapsed_seconds": 9.37
        }
      }
    },
    "dual_pathway_cad_pad_mace": {
      "category": "Atherosclerosis and Inflammation",
      "extraction": {
        "ctgov": {
          "has2x2": false,
          "hasReportedEffect": false,
          "hasResults": true,
          "matchScore": 73,
          "matchedOutcome": "Primary Safety Outcome: Number of Participants With TIMI (Thrombolysis in Myocardial Infarction) Major Bleeding",
          "recordExtract": "Primary Safety Outcome: Number of Participants With TIMI (Thrombolysis in Myocardial Infarction) Major Bleeding | Tx --/-- vs Ctrl --/--",
          "sampleNctId": "NCT02504216",
          "success": false
        },
        "pubmed": {
          "effectCount": 2,
          "firstExtract": "HR, 0.73 [95% CI, 0.60-0.88]",
          "pmid": "41757414",
          "success": true,
          "title": "Low-Dose Rivaroxaban Plus Aspirin in Patients With PAD Undergoing Lower Extremity Revascularization With and Without History of Prior Limb Revascularization: Insight From the VOYAGER-PAD Trial."
        }
      },
      "failReasons": [
        "ctgov_extract"
      ],
      "name": "Dual-pathway inhibition in CAD/PAD - MACE",
      "policy": {
        "allowedSources": [
          "ctgov",
          "pubmed",
          "openalex"
        ],
        "extractionMode": "pubmed-abstract-and-ctgov-records-only",
        "pass": true,
        "pdfUploadHidden": true,
        "pdfViewerHidden": true,
        "yearFloor": 2015
      },
      "screening": {
        "humanCheckable": true,
        "recordsWithAnchors": 1
      },
      "search": {
        "ctgov": {
          "anchorRecall": 0.5,
          "count": 18,
          "eligible": 2,
          "firstResult": {
            "nctId": "NCT05122455",
            "title": "Effects of Edoxaban on Platelet Aggregation in Patients With Stable Coronary Artery Disease",
            "year": "2021"
          },
          "matched": [
            "NCT01776424"
          ],
          "statusText": "CT.gov: kept 18 trials after applying the 2015+ floor"
        },
        "openalex": {
          "anchorRecall": 1,
          "count": 20,
          "eligible": 2,
          "firstResult": {
            "doi": "10.1016/s0140-6736(17)32409-1",
            "title": "Rivaroxaban with or without aspirin in patients with stable peripheral or carotid artery disease: an international, randomised, double-blind, placebo-controlled trial",
            "year": "2017"
          },
          "matched": [
            "NCT01776424",
            "NCT02504216"
          ],
          "statusText": "OpenAlex: kept 20 records after applying the 2015+ floor"
        },
        "pubmed": {
          "anchorRecall": 1,
          "count": 20,
          "eligible": 2,
          "firstResult": {
            "doi": "10.2174/0115748871405002251201151146",
            "pmid": "41830579",
            "title": "Impacts of Rivaroxaban on Functional Outcomes in Patients with Lower-extremity Peripheral Artery Disease Following Endovascular Revascularization: A Randomized Double-blinded Controlled Trial.",
            "year": "2026"
          },
          "matched": [
            "NCT01776424",
            "NCT02504216"
          ],
          "statusText": "2979 total results (PubMed: 20)"
        }
      },
      "status": "warn",
      "topicId": "dual_pathway_cad_pad_mace",
      "validationPackId": "pairwise70_cardio",
      "id": "dual_pathway_cad_pad_mace",
      "pack": {
        "id": "pairwise70_cardio",
        "meta": {
          "counts": {
            "error": 0,
            "fail": 0,
            "pass": 45,
            "passRate": 100,
            "prepared": 45
          },
          "date": "2026-02-27",
          "id": "pairwise70_cardio",
          "name": "Pairwise70 Cardio End-to-End",
          "sourcePath": "validation/reports/pairwise70_cardio_benchmark/pairwise70_cardio_end_to_end_report.json",
          "summary": "45/45 prepared cardiovascular datasets passed using ClinicalTrials.gov, PubMed, and OpenAlex only, with no PDF extraction pipeline.",
          "tier": "domain",
          "verdict": "PASS"
        },
        "report_summary": {
          "scope": {
            "domain": "cardiovascular",
            "design": "RCT-focused Pairwise70 Cochrane study-level",
            "sources": [
              "ClinicalTrials.gov",
              "AACT",
              "PubMed",
              "OpenAlex"
            ],
            "pdf_pipeline_used": false
          },
          "counts": {
            "cardio_review_ids": 52,
            "cardio_dataset_files": 47,
            "prepared_datasets": 45,
            "skipped_datasets": 2,
            "pass": 45,
            "fail": 0,
            "error": 0,
            "pass_rate": 100.0
          },
          "elapsed_seconds": 9.37
        }
      }
    },
    "dual_pathway_cad_pad_limb": {
      "category": "Atherosclerosis and Inflammation",
      "extraction": {
        "ctgov": {
          "has2x2": false,
          "hasReportedEffect": false,
          "hasResults": true,
          "matchScore": 97,
          "matchedOutcome": "Primary Efficacy Outcome: Number of Participants With Composite of Myocardial Infarction (MI), Ischemic Stroke, Cardiovascular Death, Acute Limb Ischemia (ALI) and Major Amputation Due to a Vascular Etiology",
          "recordExtract": "Primary Efficacy Outcome: Number of Participants With Composite of Myocardial Infarction (MI), Ischemic Stroke, Cardiovascular Death, Acute Limb Ischemia (ALI) and Major Amputation Due to a Vascular Etiology | Tx --/-- vs Ctrl --/--",
          "sampleNctId": "NCT02504216",
          "success": false
        },
        "pubmed": {
          "effectCount": 2,
          "firstExtract": "HR, 0.73 [95% CI, 0.60-0.88]",
          "pmid": "41757414",
          "success": true,
          "title": "Low-Dose Rivaroxaban Plus Aspirin in Patients With PAD Undergoing Lower Extremity Revascularization With and Without History of Prior Limb Revascularization: Insight From the VOYAGER-PAD Trial."
        }
      },
      "failReasons": [
        "ctgov_extract"
      ],
      "name": "Dual-pathway inhibition in CAD/PAD - Limb outcomes",
      "policy": {
        "allowedSources": [
          "ctgov",
          "pubmed",
          "openalex"
        ],
        "extractionMode": "pubmed-abstract-and-ctgov-records-only",
        "pass": true,
        "pdfUploadHidden": true,
        "pdfViewerHidden": true,
        "yearFloor": 2015
      },
      "screening": {
        "humanCheckable": true,
        "recordsWithAnchors": 1
      },
      "search": {
        "ctgov": {
          "anchorRecall": 0.5,
          "count": 18,
          "eligible": 2,
          "firstResult": {
            "nctId": "NCT05122455",
            "title": "Effects of Edoxaban on Platelet Aggregation in Patients With Stable Coronary Artery Disease",
            "year": "2021"
          },
          "matched": [
            "NCT01776424"
          ],
          "statusText": "CT.gov: kept 18 trials after applying the 2015+ floor"
        },
        "openalex": {
          "anchorRecall": 1,
          "count": 20,
          "eligible": 2,
          "firstResult": {
            "doi": "10.1016/s0140-6736(17)32409-1",
            "title": "Rivaroxaban with or without aspirin in patients with stable peripheral or carotid artery disease: an international, randomised, double-blind, placebo-controlled trial",
            "year": "2017"
          },
          "matched": [
            "NCT01776424",
            "NCT02504216"
          ],
          "statusText": "OpenAlex: kept 20 records after applying the 2015+ floor"
        },
        "pubmed": {
          "anchorRecall": 1,
          "count": 20,
          "eligible": 2,
          "firstResult": {
            "doi": "10.2174/0115748871405002251201151146",
            "pmid": "41830579",
            "title": "Impacts of Rivaroxaban on Functional Outcomes in Patients with Lower-extremity Peripheral Artery Disease Following Endovascular Revascularization: A Randomized Double-blinded Controlled Trial.",
            "year": "2026"
          },
          "matched": [
            "NCT01776424",
            "NCT02504216"
          ],
          "statusText": "3037 total results (PubMed: 20)"
        }
      },
      "status": "warn",
      "topicId": "dual_pathway_cad_pad_limb",
      "validationPackId": "pairwise70_cardio",
      "id": "dual_pathway_cad_pad_limb",
      "pack": {
        "id": "pairwise70_cardio",
        "meta": {
          "counts": {
            "error": 0,
            "fail": 0,
            "pass": 45,
            "passRate": 100,
            "prepared": 45
          },
          "date": "2026-02-27",
          "id": "pairwise70_cardio",
          "name": "Pairwise70 Cardio End-to-End",
          "sourcePath": "validation/reports/pairwise70_cardio_benchmark/pairwise70_cardio_end_to_end_report.json",
          "summary": "45/45 prepared cardiovascular datasets passed using ClinicalTrials.gov, PubMed, and OpenAlex only, with no PDF extraction pipeline.",
          "tier": "domain",
          "verdict": "PASS"
        },
        "report_summary": {
          "scope": {
            "domain": "cardiovascular",
            "design": "RCT-focused Pairwise70 Cochrane study-level",
            "sources": [
              "ClinicalTrials.gov",
              "AACT",
              "PubMed",
              "OpenAlex"
            ],
            "pdf_pipeline_used": false
          },
          "counts": {
            "cardio_review_ids": 52,
            "cardio_dataset_files": 47,
            "prepared_datasets": 45,
            "skipped_datasets": 2,
            "pass": 45,
            "fail": 0,
            "error": 0,
            "pass_rate": 100.0
          },
          "elapsed_seconds": 9.37
        }
      }
    },
    "dual_pathway_cad_pad_bleeding": {
      "category": "Atherosclerosis and Inflammation",
      "extraction": {
        "ctgov": {
          "has2x2": false,
          "hasReportedEffect": false,
          "hasResults": true,
          "matchScore": 49,
          "matchedOutcome": "Primary Safety Outcome: Number of Participants With TIMI (Thrombolysis in Myocardial Infarction) Major Bleeding",
          "recordExtract": "Primary Safety Outcome: Number of Participants With TIMI (Thrombolysis in Myocardial Infarction) Major Bleeding | Tx --/-- vs Ctrl --/--",
          "sampleNctId": "NCT02504216",
          "success": false
        },
        "pubmed": {
          "effectCount": 2,
          "firstExtract": "HR, 0.73 [95% CI, 0.60-0.88]",
          "pmid": "41757414",
          "success": true,
          "title": "Low-Dose Rivaroxaban Plus Aspirin in Patients With PAD Undergoing Lower Extremity Revascularization With and Without History of Prior Limb Revascularization: Insight From the VOYAGER-PAD Trial."
        }
      },
      "failReasons": [
        "ctgov_extract"
      ],
      "name": "Dual-pathway inhibition in CAD/PAD - Bleeding",
      "policy": {
        "allowedSources": [
          "ctgov",
          "pubmed",
          "openalex"
        ],
        "extractionMode": "pubmed-abstract-and-ctgov-records-only",
        "pass": true,
        "pdfUploadHidden": true,
        "pdfViewerHidden": true,
        "yearFloor": 2015
      },
      "screening": {
        "humanCheckable": true,
        "recordsWithAnchors": 1
      },
      "search": {
        "ctgov": {
          "anchorRecall": 0.5,
          "count": 18,
          "eligible": 2,
          "firstResult": {
            "nctId": "NCT05122455",
            "title": "Effects of Edoxaban on Platelet Aggregation in Patients With Stable Coronary Artery Disease",
            "year": "2021"
          },
          "matched": [
            "NCT01776424"
          ],
          "statusText": "CT.gov: kept 18 trials after applying the 2015+ floor"
        },
        "openalex": {
          "anchorRecall": 1,
          "count": 20,
          "eligible": 2,
          "firstResult": {
            "doi": "10.1016/s0140-6736(17)32409-1",
            "title": "Rivaroxaban with or without aspirin in patients with stable peripheral or carotid artery disease: an international, randomised, double-blind, placebo-controlled trial",
            "year": "2017"
          },
          "matched": [
            "NCT01776424",
            "NCT02504216"
          ],
          "statusText": "OpenAlex: kept 20 records after applying the 2015+ floor"
        },
        "pubmed": {
          "anchorRecall": 1,
          "count": 20,
          "eligible": 2,
          "firstResult": {
            "doi": "10.2174/0115748871405002251201151146",
            "pmid": "41830579",
            "title": "Impacts of Rivaroxaban on Functional Outcomes in Patients with Lower-extremity Peripheral Artery Disease Following Endovascular Revascularization: A Randomized Double-blinded Controlled Trial.",
            "year": "2026"
          },
          "matched": [
            "NCT01776424",
            "NCT02504216"
          ],
          "statusText": "3095 total results (PubMed: 20)"
        }
      },
      "status": "warn",
      "topicId": "dual_pathway_cad_pad_bleeding",
      "validationPackId": "pairwise70_cardio",
      "id": "dual_pathway_cad_pad_bleeding",
      "pack": {
        "id": "pairwise70_cardio",
        "meta": {
          "counts": {
            "error": 0,
            "fail": 0,
            "pass": 45,
            "passRate": 100,
            "prepared": 45
          },
          "date": "2026-02-27",
          "id": "pairwise70_cardio",
          "name": "Pairwise70 Cardio End-to-End",
          "sourcePath": "validation/reports/pairwise70_cardio_benchmark/pairwise70_cardio_end_to_end_report.json",
          "summary": "45/45 prepared cardiovascular datasets passed using ClinicalTrials.gov, PubMed, and OpenAlex only, with no PDF extraction pipeline.",
          "tier": "domain",
          "verdict": "PASS"
        },
        "report_summary": {
          "scope": {
            "domain": "cardiovascular",
            "design": "RCT-focused Pairwise70 Cochrane study-level",
            "sources": [
              "ClinicalTrials.gov",
              "AACT",
              "PubMed",
              "OpenAlex"
            ],
            "pdf_pipeline_used": false
          },
          "counts": {
            "cardio_review_ids": 52,
            "cardio_dataset_files": 47,
            "prepared_datasets": 45,
            "skipped_datasets": 2,
            "pass": 45,
            "fail": 0,
            "error": 0,
            "pass_rate": 100.0
          },
          "elapsed_seconds": 9.37
        }
      }
    },
    "aspirin_primary_prevention_mace": {
      "category": "Prevention",
      "extraction": {
        "ctgov": {
          "has2x2": false,
          "hasReportedEffect": false,
          "hasResults": false,
          "matchScore": 55,
          "matchedOutcome": "Time to the First Occurrence of the Individual Components of the Primary: Non-fatal MI, Total MI, Non-fatal Stroke, Total Stroke, Cardiovascular Death, UA and TIA",
          "recordExtract": "Time to the First Occurrence of the Individual Components of the Primary: Non-fatal MI, Total MI, Non-fatal Stroke, Total Stroke, Cardiovascular Death, UA and TIA | Tx --/-- vs Ctrl --/--",
          "sampleNctId": "NCT01038583",
          "success": false
        },
        "pubmed": {
          "effectCount": 1,
          "firstExtract": "HR, 0.91; 95% CI, 0.72-1.16",
          "pmid": "41091476",
          "success": true,
          "title": "Clonal Hematopoiesis and Cardiovascular Disease and Bleeding Risk and the Effectiveness of Aspirin."
        }
      },
      "failReasons": [
        "ctgov_anchor_recall",
        "ctgov_extract"
      ],
      "name": "Aspirin for primary prevention - MACE",
      "policy": {
        "allowedSources": [
          "ctgov",
          "pubmed",
          "openalex"
        ],
        "extractionMode": "pubmed-abstract-and-ctgov-records-only",
        "pass": true,
        "pdfUploadHidden": true,
        "pdfViewerHidden": true,
        "yearFloor": 2015
      },
      "screening": {
        "humanCheckable": true,
        "recordsWithAnchors": 0
      },
      "search": {
        "ctgov": {
          "anchorRecall": 0,
          "count": 8,
          "eligible": 3,
          "firstResult": {
            "nctId": "NCT02642419",
            "title": "Atrial Fibrillation and Ischemic Events With Rivaroxaban in Patients With Stable Coronary Artery Disease Study (AFIRE Study)",
            "year": "2015"
          },
          "matched": [],
          "statusText": "CT.gov: kept 8 trials after applying the 2015+ floor"
        },
        "openalex": {
          "anchorRecall": 0,
          "count": 20,
          "eligible": 3,
          "firstResult": {
            "doi": "10.1007/s10557-018-6802-1",
            "pmid": "29943364",
            "title": "Aspirin for Primary Prevention of Cardiovascular Disease and Renal Disease Progression in Chronic Kidney Disease Patients: a Multicenter Randomized Clinical Trial (AASER Study)",
            "year": "2018"
          },
          "matched": [],
          "statusText": "OpenAlex: kept 20 records after applying the 2015+ floor"
        },
        "pubmed": {
          "anchorRecall": 0.6666666666666666,
          "count": 20,
          "eligible": 3,
          "firstResult": {
            "doi": "10.1002/14651858.CD015266.pub2",
            "pmid": "41740630",
            "title": "Aspirin and other nonsteroidal anti-inflammatory drugs (NSAIDs) for preventing colorectal cancer and colorectal adenoma in the general population.",
            "year": "2026"
          },
          "matched": [
            "NCT00135226",
            "NCT01038583"
          ],
          "statusText": "3143 total results (PubMed: 20)"
        }
      },
      "status": "warn",
      "topicId": "aspirin_primary_prevention_mace",
      "validationPackId": "pairwise70_cardio",
      "id": "aspirin_primary_prevention_mace",
      "pack": {
        "id": "pairwise70_cardio",
        "meta": {
          "counts": {
            "error": 0,
            "fail": 0,
            "pass": 45,
            "passRate": 100,
            "prepared": 45
          },
          "date": "2026-02-27",
          "id": "pairwise70_cardio",
          "name": "Pairwise70 Cardio End-to-End",
          "sourcePath": "validation/reports/pairwise70_cardio_benchmark/pairwise70_cardio_end_to_end_report.json",
          "summary": "45/45 prepared cardiovascular datasets passed using ClinicalTrials.gov, PubMed, and OpenAlex only, with no PDF extraction pipeline.",
          "tier": "domain",
          "verdict": "PASS"
        },
        "report_summary": {
          "scope": {
            "domain": "cardiovascular",
            "design": "RCT-focused Pairwise70 Cochrane study-level",
            "sources": [
              "ClinicalTrials.gov",
              "AACT",
              "PubMed",
              "OpenAlex"
            ],
            "pdf_pipeline_used": false
          },
          "counts": {
            "cardio_review_ids": 52,
            "cardio_dataset_files": 47,
            "prepared_datasets": 45,
            "skipped_datasets": 2,
            "pass": 45,
            "fail": 0,
            "error": 0,
            "pass_rate": 100.0
          },
          "elapsed_seconds": 9.37
        }
      }
    },
    "aspirin_primary_prevention_diabetes": {
      "category": "Prevention",
      "extraction": {
        "ctgov": {
          "has2x2": false,
          "hasReportedEffect": false,
          "hasResults": false,
          "matchScore": 67,
          "matchedOutcome": "Time to the First Occurrence of the Individual Components of the Primary: Non-fatal MI, Total MI, Non-fatal Stroke, Total Stroke, Cardiovascular Death, UA and TIA",
          "recordExtract": "Time to the First Occurrence of the Individual Components of the Primary: Non-fatal MI, Total MI, Non-fatal Stroke, Total Stroke, Cardiovascular Death, UA and TIA | Tx --/-- vs Ctrl --/--",
          "sampleNctId": "NCT01038583",
          "success": false
        },
        "pubmed": {
          "effectCount": 1,
          "firstExtract": "HR, 0.91; 95% CI, 0.72-1.16",
          "pmid": "41091476",
          "success": true,
          "title": "Clonal Hematopoiesis and Cardiovascular Disease and Bleeding Risk and the Effectiveness of Aspirin."
        }
      },
      "failReasons": [
        "ctgov_anchor_recall",
        "ctgov_extract"
      ],
      "name": "Aspirin for primary prevention - Diabetes subgroup",
      "policy": {
        "allowedSources": [
          "ctgov",
          "pubmed",
          "openalex"
        ],
        "extractionMode": "pubmed-abstract-and-ctgov-records-only",
        "pass": true,
        "pdfUploadHidden": true,
        "pdfViewerHidden": true,
        "yearFloor": 2015
      },
      "screening": {
        "humanCheckable": true,
        "recordsWithAnchors": 0
      },
      "search": {
        "ctgov": {
          "anchorRecall": 0,
          "count": 8,
          "eligible": 3,
          "firstResult": {
            "nctId": "NCT02642419",
            "title": "Atrial Fibrillation and Ischemic Events With Rivaroxaban in Patients With Stable Coronary Artery Disease Study (AFIRE Study)",
            "year": "2015"
          },
          "matched": [],
          "statusText": "CT.gov: kept 8 trials after applying the 2015+ floor"
        },
        "openalex": {
          "anchorRecall": 0,
          "count": 20,
          "eligible": 3,
          "firstResult": {
            "doi": "10.1007/s10557-018-6802-1",
            "pmid": "29943364",
            "title": "Aspirin for Primary Prevention of Cardiovascular Disease and Renal Disease Progression in Chronic Kidney Disease Patients: a Multicenter Randomized Clinical Trial (AASER Study)",
            "year": "2018"
          },
          "matched": [],
          "statusText": "OpenAlex: kept 20 records after applying the 2015+ floor"
        },
        "pubmed": {
          "anchorRecall": 0.6666666666666666,
          "count": 20,
          "eligible": 3,
          "firstResult": {
            "doi": "10.1002/14651858.CD015266.pub2",
            "pmid": "41740630",
            "title": "Aspirin and other nonsteroidal anti-inflammatory drugs (NSAIDs) for preventing colorectal cancer and colorectal adenoma in the general population.",
            "year": "2026"
          },
          "matched": [
            "NCT00135226",
            "NCT01038583"
          ],
          "statusText": "3191 total results (PubMed: 20)"
        }
      },
      "status": "warn",
      "topicId": "aspirin_primary_prevention_diabetes",
      "validationPackId": "pairwise70_cardio",
      "id": "aspirin_primary_prevention_diabetes",
      "pack": {
        "id": "pairwise70_cardio",
        "meta": {
          "counts": {
            "error": 0,
            "fail": 0,
            "pass": 45,
            "passRate": 100,
            "prepared": 45
          },
          "date": "2026-02-27",
          "id": "pairwise70_cardio",
          "name": "Pairwise70 Cardio End-to-End",
          "sourcePath": "validation/reports/pairwise70_cardio_benchmark/pairwise70_cardio_end_to_end_report.json",
          "summary": "45/45 prepared cardiovascular datasets passed using ClinicalTrials.gov, PubMed, and OpenAlex only, with no PDF extraction pipeline.",
          "tier": "domain",
          "verdict": "PASS"
        },
        "report_summary": {
          "scope": {
            "domain": "cardiovascular",
            "design": "RCT-focused Pairwise70 Cochrane study-level",
            "sources": [
              "ClinicalTrials.gov",
              "AACT",
              "PubMed",
              "OpenAlex"
            ],
            "pdf_pipeline_used": false
          },
          "counts": {
            "cardio_review_ids": 52,
            "cardio_dataset_files": 47,
            "prepared_datasets": 45,
            "skipped_datasets": 2,
            "pass": 45,
            "fail": 0,
            "error": 0,
            "pass_rate": 100.0
          },
          "elapsed_seconds": 9.37
        }
      }
    },
    "polypill_prevention_mace": {
      "category": "Prevention",
      "extraction": {
        "ctgov": {
          "has2x2": false,
          "hasReportedEffect": false,
          "hasResults": true,
          "matchScore": 98,
          "matchedOutcome": "Major Cardiovascular Adverse Events (MACE)",
          "recordExtract": "Major Cardiovascular Adverse Events (MACE) | Tx --/-- vs Ctrl --/--",
          "sampleNctId": "NCT02596126",
          "success": false
        },
        "pubmed": {
          "effectCount": 2,
          "firstExtract": "RR=1.45 (95%CI: 1.18-1.78)",
          "pmid": "41646739",
          "success": true,
          "title": "A Randomized Feasibility Trial of a Multicomponent Quality Improvement Strategy for Chronic Care of Cardiovascular Diseases: Findings from the C-QIP Trial in India."
        }
      },
      "failReasons": [
        "ctgov_anchor_recall",
        "ctgov_extract"
      ],
      "name": "Cardiovascular polypill strategies - MACE",
      "policy": {
        "allowedSources": [
          "ctgov",
          "pubmed",
          "openalex"
        ],
        "extractionMode": "pubmed-abstract-and-ctgov-records-only",
        "pass": true,
        "pdfUploadHidden": true,
        "pdfViewerHidden": true,
        "yearFloor": 2015
      },
      "screening": {
        "humanCheckable": true,
        "recordsWithAnchors": 0
      },
      "search": {
        "ctgov": {
          "anchorRecall": 0,
          "count": 12,
          "eligible": 2,
          "firstResult": {
            "nctId": "NCT05476913",
            "title": "A Randomised Controlled Trial of the Effectiveness of Intermittent Surface Neuromuscular Stimulation Using the Geko\u2122 Device Compared With Intermittent Pneumatic Compression to Prevent Venous Thromboembolism in Immobile Acute Stroke Patients",
            "year": "2023"
          },
          "matched": [],
          "statusText": "CT.gov: kept 12 trials after applying the 2015+ floor"
        },
        "openalex": {
          "anchorRecall": 0.3333333333333333,
          "count": 20,
          "eligible": 3,
          "firstResult": {
            "nctId": "NCT01245608",
            "pmid": "26265520",
            "title": "PolyPill for Prevention of Cardiovascular Disease in an Urban Iranian Population with Special Focus on Nonalcoholic Steatohepatitis: A Pragmatic Randomized Controlled Trial within a Cohort (PolyIran - Liver) - Study Protocol.",
            "year": "2015"
          },
          "matched": [
            "POLYIRAN"
          ],
          "statusText": "OpenAlex: kept 20 records after applying the 2015+ floor"
        },
        "pubmed": {
          "anchorRecall": 0.3333333333333333,
          "count": 20,
          "eligible": 3,
          "firstResult": {
            "doi": "10.1007/s12325-026-03525-3",
            "nctId": "NCT03904693",
            "pmid": "41820779",
            "title": "Long-Term Treatment with Single-Tablet Combination of Macitentan and Tadalafil in Pulmonary Arterial Hypertension: Results from A DUE and Its Open-Label Period.",
            "year": "2026"
          },
          "matched": [
            "POLYIRAN"
          ],
          "statusText": "3243 total results (PubMed: 20)"
        }
      },
      "status": "warn",
      "topicId": "polypill_prevention_mace",
      "validationPackId": "pairwise70_cardio",
      "id": "polypill_prevention_mace",
      "pack": {
        "id": "pairwise70_cardio",
        "meta": {
          "counts": {
            "error": 0,
            "fail": 0,
            "pass": 45,
            "passRate": 100,
            "prepared": 45
          },
          "date": "2026-02-27",
          "id": "pairwise70_cardio",
          "name": "Pairwise70 Cardio End-to-End",
          "sourcePath": "validation/reports/pairwise70_cardio_benchmark/pairwise70_cardio_end_to_end_report.json",
          "summary": "45/45 prepared cardiovascular datasets passed using ClinicalTrials.gov, PubMed, and OpenAlex only, with no PDF extraction pipeline.",
          "tier": "domain",
          "verdict": "PASS"
        },
        "report_summary": {
          "scope": {
            "domain": "cardiovascular",
            "design": "RCT-focused Pairwise70 Cochrane study-level",
            "sources": [
              "ClinicalTrials.gov",
              "AACT",
              "PubMed",
              "OpenAlex"
            ],
            "pdf_pipeline_used": false
          },
          "counts": {
            "cardio_review_ids": 52,
            "cardio_dataset_files": 47,
            "prepared_datasets": 45,
            "skipped_datasets": 2,
            "pass": 45,
            "fail": 0,
            "error": 0,
            "pass_rate": 100.0
          },
          "elapsed_seconds": 9.37
        }
      }
    },
    "polypill_prevention_adherence": {
      "category": "Prevention",
      "extraction": {
        "ctgov": {
          "has2x2": false,
          "hasReportedEffect": false,
          "hasResults": true,
          "matchScore": 15,
          "matchedOutcome": "Major Cardiovascular Adverse Events (MACE)",
          "recordExtract": "Major Cardiovascular Adverse Events (MACE) | Tx --/-- vs Ctrl --/--",
          "sampleNctId": "NCT02596126",
          "success": false
        },
        "pubmed": {
          "effectCount": 2,
          "firstExtract": "RR=1.45 (95%CI: 1.18-1.78)",
          "pmid": "41646739",
          "success": true,
          "title": "A Randomized Feasibility Trial of a Multicomponent Quality Improvement Strategy for Chronic Care of Cardiovascular Diseases: Findings from the C-QIP Trial in India."
        }
      },
      "failReasons": [
        "ctgov_anchor_recall",
        "ctgov_extract"
      ],
      "name": "Cardiovascular polypill strategies - Adherence",
      "policy": {
        "allowedSources": [
          "ctgov",
          "pubmed",
          "openalex"
        ],
        "extractionMode": "pubmed-abstract-and-ctgov-records-only",
        "pass": true,
        "pdfUploadHidden": true,
        "pdfViewerHidden": true,
        "yearFloor": 2015
      },
      "screening": {
        "humanCheckable": true,
        "recordsWithAnchors": 0
      },
      "search": {
        "ctgov": {
          "anchorRecall": 0,
          "count": 12,
          "eligible": 2,
          "firstResult": {
            "nctId": "NCT05476913",
            "title": "A Randomised Controlled Trial of the Effectiveness of Intermittent Surface Neuromuscular Stimulation Using the Geko\u2122 Device Compared With Intermittent Pneumatic Compression to Prevent Venous Thromboembolism in Immobile Acute Stroke Patients",
            "year": "2023"
          },
          "matched": [],
          "statusText": "CT.gov: kept 12 trials after applying the 2015+ floor"
        },
        "openalex": {
          "anchorRecall": 0.3333333333333333,
          "count": 20,
          "eligible": 3,
          "firstResult": {
            "nctId": "NCT01245608",
            "pmid": "26265520",
            "title": "PolyPill for Prevention of Cardiovascular Disease in an Urban Iranian Population with Special Focus on Nonalcoholic Steatohepatitis: A Pragmatic Randomized Controlled Trial within a Cohort (PolyIran - Liver) - Study Protocol.",
            "year": "2015"
          },
          "matched": [
            "POLYIRAN"
          ],
          "statusText": "OpenAlex: kept 20 records after applying the 2015+ floor"
        },
        "pubmed": {
          "anchorRecall": 0.3333333333333333,
          "count": 20,
          "eligible": 3,
          "firstResult": {
            "doi": "10.1007/s12325-026-03525-3",
            "nctId": "NCT03904693",
            "pmid": "41820779",
            "title": "Long-Term Treatment with Single-Tablet Combination of Macitentan and Tadalafil in Pulmonary Arterial Hypertension: Results from A DUE and Its Open-Label Period.",
            "year": "2026"
          },
          "matched": [
            "POLYIRAN"
          ],
          "statusText": "3295 total results (PubMed: 20)"
        }
      },
      "status": "warn",
      "topicId": "polypill_prevention_adherence",
      "validationPackId": "pairwise70_cardio",
      "id": "polypill_prevention_adherence",
      "pack": {
        "id": "pairwise70_cardio",
        "meta": {
          "counts": {
            "error": 0,
            "fail": 0,
            "pass": 45,
            "passRate": 100,
            "prepared": 45
          },
          "date": "2026-02-27",
          "id": "pairwise70_cardio",
          "name": "Pairwise70 Cardio End-to-End",
          "sourcePath": "validation/reports/pairwise70_cardio_benchmark/pairwise70_cardio_end_to_end_report.json",
          "summary": "45/45 prepared cardiovascular datasets passed using ClinicalTrials.gov, PubMed, and OpenAlex only, with no PDF extraction pipeline.",
          "tier": "domain",
          "verdict": "PASS"
        },
        "report_summary": {
          "scope": {
            "domain": "cardiovascular",
            "design": "RCT-focused Pairwise70 Cochrane study-level",
            "sources": [
              "ClinicalTrials.gov",
              "AACT",
              "PubMed",
              "OpenAlex"
            ],
            "pdf_pipeline_used": false
          },
          "counts": {
            "cardio_review_ids": 52,
            "cardio_dataset_files": 47,
            "prepared_datasets": 45,
            "skipped_datasets": 2,
            "pass": 45,
            "fail": 0,
            "error": 0,
            "pass_rate": 100.0
          },
          "elapsed_seconds": 9.37
        }
      }
    },
    "obesity_incretins_weight": {
      "category": "Obesity and Metabolism",
      "extraction": {
        "ctgov": {
          "has2x2": false,
          "hasReportedEffect": false,
          "hasResults": true,
          "matchScore": 39,
          "matchedOutcome": "Percentage of Participants With \u226550% AHI Reduction From Baseline",
          "recordExtract": "Percentage of Participants With \u226550% AHI Reduction From Baseline | Tx --/-- vs Ctrl --/--",
          "sampleNctId": "NCT05412004",
          "success": false
        },
        "pubmed": {
          "effectCount": 1,
          "firstExtract": "odds ratio: 11.37 (95% confidence interval: 8.10-15.98",
          "pmid": "41824845",
          "success": true,
          "title": "GLP-1 receptor agonists for weight loss: A systematic review and meta-analysis of randomized controlled trials."
        }
      },
      "failReasons": [
        "ctgov_extract"
      ],
      "name": "Semaglutide and tirzepatide in obesity - Weight loss",
      "policy": {
        "allowedSources": [
          "ctgov",
          "pubmed",
          "openalex"
        ],
        "extractionMode": "pubmed-abstract-and-ctgov-records-only",
        "pass": true,
        "pdfUploadHidden": true,
        "pdfViewerHidden": true,
        "yearFloor": 2015
      },
      "screening": {
        "humanCheckable": true,
        "recordsWithAnchors": 1
      },
      "search": {
        "ctgov": {
          "anchorRecall": 0.2,
          "count": 20,
          "eligible": 5,
          "firstResult": {
            "nctId": "NCT07139405",
            "title": "A DOUBLE-BLIND, RANDOMIZED, ACTIVE-CONTROLLED, PARALLEL-GROUP, PHASE II TRIAL TO EVALUATE THE SAFETY, TOLERABILITY, AND SUPERIORITY OF TRIGLYTZA\u00ae OVER METFORMIN IN PATIENTS WITH INADEQUATE GLYCEMIC CONTROL OVER 24 WEEKS OF TREATMENT",
            "year": "2026"
          },
          "matched": [
            "NCT03574597"
          ],
          "statusText": "CT.gov: kept 20 trials after applying the 2015+ floor"
        },
        "openalex": {
          "anchorRecall": 0.8,
          "count": 20,
          "eligible": 5,
          "firstResult": {
            "doi": "10.1093/gastro/goae029",
            "pmid": "38681750",
            "title": "Advancements in pharmacological treatment of NAFLD/MASLD: a focus on metabolic and liver-targeted interventions",
            "year": "2023"
          },
          "matched": [
            "NCT03548935",
            "NCT04184622",
            "NCT03574597",
            "NCT05412004"
          ],
          "statusText": "OpenAlex: kept 20 records after applying the 2015+ floor"
        },
        "pubmed": {
          "anchorRecall": 0.4,
          "count": 20,
          "eligible": 5,
          "firstResult": {
            "doi": "10.1097/MD.0000000000047994",
            "pmid": "41824845",
            "title": "GLP-1 receptor agonists for weight loss: A systematic review and meta-analysis of randomized controlled trials.",
            "year": "2026"
          },
          "matched": [
            "NCT03548935",
            "NCT03574597"
          ],
          "statusText": "3355 total results (PubMed: 20)"
        }
      },
      "status": "warn",
      "topicId": "obesity_incretins_weight",
      "validationPackId": "pairwise70_cardio",
      "id": "obesity_incretins_weight",
      "pack": {
        "id": "pairwise70_cardio",
        "meta": {
          "counts": {
            "error": 0,
            "fail": 0,
            "pass": 45,
            "passRate": 100,
            "prepared": 45
          },
          "date": "2026-02-27",
          "id": "pairwise70_cardio",
          "name": "Pairwise70 Cardio End-to-End",
          "sourcePath": "validation/reports/pairwise70_cardio_benchmark/pairwise70_cardio_end_to_end_report.json",
          "summary": "45/45 prepared cardiovascular datasets passed using ClinicalTrials.gov, PubMed, and OpenAlex only, with no PDF extraction pipeline.",
          "tier": "domain",
          "verdict": "PASS"
        },
        "report_summary": {
          "scope": {
            "domain": "cardiovascular",
            "design": "RCT-focused Pairwise70 Cochrane study-level",
            "sources": [
              "ClinicalTrials.gov",
              "AACT",
              "PubMed",
              "OpenAlex"
            ],
            "pdf_pipeline_used": false
          },
          "counts": {
            "cardio_review_ids": 52,
            "cardio_dataset_files": 47,
            "prepared_datasets": 45,
            "skipped_datasets": 2,
            "pass": 45,
            "fail": 0,
            "error": 0,
            "pass_rate": 100.0
          },
          "elapsed_seconds": 9.37
        }
      }
    },
    "obesity_incretins_mace": {
      "category": "Obesity and Metabolism",
      "extraction": {
        "ctgov": {
          "has2x2": false,
          "hasReportedEffect": false,
          "hasResults": true,
          "matchScore": 27,
          "matchedOutcome": "Change From Baseline in Patient-Reported Outcomes Measurement Information System (PROMIS) Short Form Sleep-Related Impairment 8a (PROMIS SRI) and PROMIS Short Form Sleep Disturbance 8b (PROMIS SD)",
          "recordExtract": "Change From Baseline in Patient-Reported Outcomes Measurement Information System (PROMIS) Short Form Sleep-Related Impairment 8a (PROMIS SRI) and PROMIS Short Form Sleep Disturbance 8b (PROMIS SD) | Tx --/-- vs Ctrl --/--",
          "sampleNctId": "NCT05412004",
          "success": false
        },
        "pubmed": {
          "effectCount": 1,
          "firstExtract": "odds ratio: 11.37 (95% confidence interval: 8.10-15.98",
          "pmid": "41824845",
          "success": true,
          "title": "GLP-1 receptor agonists for weight loss: A systematic review and meta-analysis of randomized controlled trials."
        }
      },
      "failReasons": [
        "ctgov_extract"
      ],
      "name": "Semaglutide and tirzepatide in obesity - MACE",
      "policy": {
        "allowedSources": [
          "ctgov",
          "pubmed",
          "openalex"
        ],
        "extractionMode": "pubmed-abstract-and-ctgov-records-only",
        "pass": true,
        "pdfUploadHidden": true,
        "pdfViewerHidden": true,
        "yearFloor": 2015
      },
      "screening": {
        "humanCheckable": true,
        "recordsWithAnchors": 1
      },
      "search": {
        "ctgov": {
          "anchorRecall": 0.2,
          "count": 20,
          "eligible": 5,
          "firstResult": {
            "nctId": "NCT07139405",
            "title": "A DOUBLE-BLIND, RANDOMIZED, ACTIVE-CONTROLLED, PARALLEL-GROUP, PHASE II TRIAL TO EVALUATE THE SAFETY, TOLERABILITY, AND SUPERIORITY OF TRIGLYTZA\u00ae OVER METFORMIN IN PATIENTS WITH INADEQUATE GLYCEMIC CONTROL OVER 24 WEEKS OF TREATMENT",
            "year": "2026"
          },
          "matched": [
            "NCT03574597"
          ],
          "statusText": "CT.gov: kept 20 trials after applying the 2015+ floor"
        },
        "openalex": {
          "anchorRecall": 0.8,
          "count": 20,
          "eligible": 5,
          "firstResult": {
            "doi": "10.1093/gastro/goae029",
            "pmid": "38681750",
            "title": "Advancements in pharmacological treatment of NAFLD/MASLD: a focus on metabolic and liver-targeted interventions",
            "year": "2023"
          },
          "matched": [
            "NCT03548935",
            "NCT04184622",
            "NCT03574597",
            "NCT05412004"
          ],
          "statusText": "OpenAlex: kept 20 records after applying the 2015+ floor"
        },
        "pubmed": {
          "anchorRecall": 0.4,
          "count": 20,
          "eligible": 5,
          "firstResult": {
            "doi": "10.1097/MD.0000000000047994",
            "pmid": "41824845",
            "title": "GLP-1 receptor agonists for weight loss: A systematic review and meta-analysis of randomized controlled trials.",
            "year": "2026"
          },
          "matched": [
            "NCT03548935",
            "NCT03574597"
          ],
          "statusText": "3415 total results (PubMed: 20)"
        }
      },
      "status": "warn",
      "topicId": "obesity_incretins_mace",
      "validationPackId": "pairwise70_cardio",
      "id": "obesity_incretins_mace",
      "pack": {
        "id": "pairwise70_cardio",
        "meta": {
          "counts": {
            "error": 0,
            "fail": 0,
            "pass": 45,
            "passRate": 100,
            "prepared": 45
          },
          "date": "2026-02-27",
          "id": "pairwise70_cardio",
          "name": "Pairwise70 Cardio End-to-End",
          "sourcePath": "validation/reports/pairwise70_cardio_benchmark/pairwise70_cardio_end_to_end_report.json",
          "summary": "45/45 prepared cardiovascular datasets passed using ClinicalTrials.gov, PubMed, and OpenAlex only, with no PDF extraction pipeline.",
          "tier": "domain",
          "verdict": "PASS"
        },
        "report_summary": {
          "scope": {
            "domain": "cardiovascular",
            "design": "RCT-focused Pairwise70 Cochrane study-level",
            "sources": [
              "ClinicalTrials.gov",
              "AACT",
              "PubMed",
              "OpenAlex"
            ],
            "pdf_pipeline_used": false
          },
          "counts": {
            "cardio_review_ids": 52,
            "cardio_dataset_files": 47,
            "prepared_datasets": 45,
            "skipped_datasets": 2,
            "pass": 45,
            "fail": 0,
            "error": 0,
            "pass_rate": 100.0
          },
          "elapsed_seconds": 9.37
        }
      }
    },
    "obesity_incretins_sleep_apnea": {
      "category": "Obesity and Metabolism",
      "extraction": {
        "ctgov": {
          "has2x2": false,
          "hasReportedEffect": false,
          "hasResults": true,
          "matchScore": 39,
          "matchedOutcome": "Change From Baseline in Sleep Apnea-Specific Hypoxic Burden (SASHB) (% Min/Hour)",
          "recordExtract": "Change From Baseline in Sleep Apnea-Specific Hypoxic Burden (SASHB) (% Min/Hour) | Tx --/-- vs Ctrl --/--",
          "sampleNctId": "NCT05412004",
          "success": false
        },
        "pubmed": {
          "effectCount": 1,
          "firstExtract": "odds ratio: 11.37 (95% confidence interval: 8.10-15.98",
          "pmid": "41824845",
          "success": true,
          "title": "GLP-1 receptor agonists for weight loss: A systematic review and meta-analysis of randomized controlled trials."
        }
      },
      "failReasons": [
        "ctgov_extract"
      ],
      "name": "Semaglutide and tirzepatide in obesity - Sleep apnea",
      "policy": {
        "allowedSources": [
          "ctgov",
          "pubmed",
          "openalex"
        ],
        "extractionMode": "pubmed-abstract-and-ctgov-records-only",
        "pass": true,
        "pdfUploadHidden": true,
        "pdfViewerHidden": true,
        "yearFloor": 2015
      },
      "screening": {
        "humanCheckable": true,
        "recordsWithAnchors": 1
      },
      "search": {
        "ctgov": {
          "anchorRecall": 0.2,
          "count": 20,
          "eligible": 5,
          "firstResult": {
            "nctId": "NCT07139405",
            "title": "A DOUBLE-BLIND, RANDOMIZED, ACTIVE-CONTROLLED, PARALLEL-GROUP, PHASE II TRIAL TO EVALUATE THE SAFETY, TOLERABILITY, AND SUPERIORITY OF TRIGLYTZA\u00ae OVER METFORMIN IN PATIENTS WITH INADEQUATE GLYCEMIC CONTROL OVER 24 WEEKS OF TREATMENT",
            "year": "2026"
          },
          "matched": [
            "NCT03574597"
          ],
          "statusText": "CT.gov: kept 20 trials after applying the 2015+ floor"
        },
        "openalex": {
          "anchorRecall": 0.8,
          "count": 20,
          "eligible": 5,
          "firstResult": {
            "doi": "10.1093/gastro/goae029",
            "pmid": "38681750",
            "title": "Advancements in pharmacological treatment of NAFLD/MASLD: a focus on metabolic and liver-targeted interventions",
            "year": "2023"
          },
          "matched": [
            "NCT03548935",
            "NCT04184622",
            "NCT03574597",
            "NCT05412004"
          ],
          "statusText": "OpenAlex: kept 20 records after applying the 2015+ floor"
        },
        "pubmed": {
          "anchorRecall": 0.4,
          "count": 20,
          "eligible": 5,
          "firstResult": {
            "doi": "10.1097/MD.0000000000047994",
            "pmid": "41824845",
            "title": "GLP-1 receptor agonists for weight loss: A systematic review and meta-analysis of randomized controlled trials.",
            "year": "2026"
          },
          "matched": [
            "NCT03548935",
            "NCT03574597"
          ],
          "statusText": "3475 total results (PubMed: 20)"
        }
      },
      "status": "warn",
      "topicId": "obesity_incretins_sleep_apnea",
      "validationPackId": "pairwise70_cardio",
      "id": "obesity_incretins_sleep_apnea",
      "pack": {
        "id": "pairwise70_cardio",
        "meta": {
          "counts": {
            "error": 0,
            "fail": 0,
            "pass": 45,
            "passRate": 100,
            "prepared": 45
          },
          "date": "2026-02-27",
          "id": "pairwise70_cardio",
          "name": "Pairwise70 Cardio End-to-End",
          "sourcePath": "validation/reports/pairwise70_cardio_benchmark/pairwise70_cardio_end_to_end_report.json",
          "summary": "45/45 prepared cardiovascular datasets passed using ClinicalTrials.gov, PubMed, and OpenAlex only, with no PDF extraction pipeline.",
          "tier": "domain",
          "verdict": "PASS"
        },
        "report_summary": {
          "scope": {
            "domain": "cardiovascular",
            "design": "RCT-focused Pairwise70 Cochrane study-level",
            "sources": [
              "ClinicalTrials.gov",
              "AACT",
              "PubMed",
              "OpenAlex"
            ],
            "pdf_pipeline_used": false
          },
          "counts": {
            "cardio_review_ids": 52,
            "cardio_dataset_files": 47,
            "prepared_datasets": 45,
            "skipped_datasets": 2,
            "pass": 45,
            "fail": 0,
            "error": 0,
            "pass_rate": 100.0
          },
          "elapsed_seconds": 9.37
        }
      }
    },
    "obesity_incretins_quality": {
      "category": "Obesity and Metabolism",
      "extraction": {
        "ctgov": {
          "has2x2": false,
          "hasReportedEffect": false,
          "hasResults": true,
          "matchScore": 15,
          "matchedOutcome": "Change From Baseline in Apnea-Hypopnea Index (AHI)",
          "recordExtract": "Change From Baseline in Apnea-Hypopnea Index (AHI) | Tx --/-- vs Ctrl --/--",
          "sampleNctId": "NCT05412004",
          "success": false
        },
        "pubmed": {
          "effectCount": 1,
          "firstExtract": "odds ratio: 11.37 (95% confidence interval: 8.10-15.98",
          "pmid": "41824845",
          "success": true,
          "title": "GLP-1 receptor agonists for weight loss: A systematic review and meta-analysis of randomized controlled trials."
        }
      },
      "failReasons": [
        "ctgov_extract"
      ],
      "name": "Semaglutide and tirzepatide in obesity - Quality of life",
      "policy": {
        "allowedSources": [
          "ctgov",
          "pubmed",
          "openalex"
        ],
        "extractionMode": "pubmed-abstract-and-ctgov-records-only",
        "pass": true,
        "pdfUploadHidden": true,
        "pdfViewerHidden": true,
        "yearFloor": 2015
      },
      "screening": {
        "humanCheckable": true,
        "recordsWithAnchors": 1
      },
      "search": {
        "ctgov": {
          "anchorRecall": 0.2,
          "count": 20,
          "eligible": 5,
          "firstResult": {
            "nctId": "NCT07139405",
            "title": "A DOUBLE-BLIND, RANDOMIZED, ACTIVE-CONTROLLED, PARALLEL-GROUP, PHASE II TRIAL TO EVALUATE THE SAFETY, TOLERABILITY, AND SUPERIORITY OF TRIGLYTZA\u00ae OVER METFORMIN IN PATIENTS WITH INADEQUATE GLYCEMIC CONTROL OVER 24 WEEKS OF TREATMENT",
            "year": "2026"
          },
          "matched": [
            "NCT03574597"
          ],
          "statusText": "CT.gov: kept 20 trials after applying the 2015+ floor"
        },
        "openalex": {
          "anchorRecall": 0.8,
          "count": 20,
          "eligible": 5,
          "firstResult": {
            "doi": "10.1093/gastro/goae029",
            "pmid": "38681750",
            "title": "Advancements in pharmacological treatment of NAFLD/MASLD: a focus on metabolic and liver-targeted interventions",
            "year": "2023"
          },
          "matched": [
            "NCT03548935",
            "NCT04184622",
            "NCT03574597",
            "NCT05412004"
          ],
          "statusText": "OpenAlex: kept 20 records after applying the 2015+ floor"
        },
        "pubmed": {
          "anchorRecall": 0.4,
          "count": 20,
          "eligible": 5,
          "firstResult": {
            "doi": "10.1097/MD.0000000000047994",
            "pmid": "41824845",
            "title": "GLP-1 receptor agonists for weight loss: A systematic review and meta-analysis of randomized controlled trials.",
            "year": "2026"
          },
          "matched": [
            "NCT03548935",
            "NCT03574597"
          ],
          "statusText": "3535 total results (PubMed: 20)"
        }
      },
      "status": "warn",
      "topicId": "obesity_incretins_quality",
      "validationPackId": "pairwise70_cardio",
      "id": "obesity_incretins_quality",
      "pack": {
        "id": "pairwise70_cardio",
        "meta": {
          "counts": {
            "error": 0,
            "fail": 0,
            "pass": 45,
            "passRate": 100,
            "prepared": 45
          },
          "date": "2026-02-27",
          "id": "pairwise70_cardio",
          "name": "Pairwise70 Cardio End-to-End",
          "sourcePath": "validation/reports/pairwise70_cardio_benchmark/pairwise70_cardio_end_to_end_report.json",
          "summary": "45/45 prepared cardiovascular datasets passed using ClinicalTrials.gov, PubMed, and OpenAlex only, with no PDF extraction pipeline.",
          "tier": "domain",
          "verdict": "PASS"
        },
        "report_summary": {
          "scope": {
            "domain": "cardiovascular",
            "design": "RCT-focused Pairwise70 Cochrane study-level",
            "sources": [
              "ClinicalTrials.gov",
              "AACT",
              "PubMed",
              "OpenAlex"
            ],
            "pdf_pipeline_used": false
          },
          "counts": {
            "cardio_review_ids": 52,
            "cardio_dataset_files": 47,
            "prepared_datasets": 45,
            "skipped_datasets": 2,
            "pass": 45,
            "fail": 0,
            "error": 0,
            "pass_rate": 100.0
          },
          "elapsed_seconds": 9.37
        }
      }
    },
    "nsclc_immunotherapy_os": {
      "category": "Oncology",
      "extraction": {
        "ctgov": {
          "has2x2": false,
          "hasReportedEffect": false,
          "hasResults": true,
          "matchScore": 57,
          "matchedOutcome": "Overall Survival (OS) in the TC3 or IC3-WT Populations",
          "recordExtract": "Overall Survival (OS) in the TC3 or IC3-WT Populations | Tx --/-- vs Ctrl --/--",
          "sampleNctId": "NCT02409342",
          "success": false
        },
        "pubmed": {
          "effectCount": 1,
          "firstExtract": "hazard ratio = 0.36, 95% CI: 0.14-0.92",
          "pmid": "41690366",
          "success": true,
          "title": "Four-Year Outcomes of First-Line Nivolumab Plus Ipilimumab for 6 Months Versus Continuation in Patients With Advanced NSCLC: Results of the Randomized IFCT-1701 \"DICIPLE\" Phase III Trial."
        }
      },
      "failReasons": [
        "ctgov_anchor_recall",
        "ctgov_extract"
      ],
      "name": "Checkpoint immunotherapy in NSCLC - Overall survival",
      "policy": {
        "allowedSources": [
          "ctgov",
          "pubmed",
          "openalex"
        ],
        "extractionMode": "pubmed-abstract-and-ctgov-records-only",
        "pass": true,
        "pdfUploadHidden": true,
        "pdfViewerHidden": true,
        "yearFloor": 2015
      },
      "screening": {
        "humanCheckable": true,
        "recordsWithAnchors": 0
      },
      "search": {
        "ctgov": {
          "anchorRecall": 0,
          "count": 20,
          "eligible": 5,
          "firstResult": {
            "nctId": "NCT02949843",
            "title": "Phase II Pilot Study Evaluating Strategies to Overcome Resistance at the Time of Progression for Patients With Non-small Cell Lung Cancers Harboring Major Oncogenic Drivers",
            "year": "2017"
          },
          "matched": [],
          "statusText": "CT.gov: kept 20 trials after applying the 2015+ floor"
        },
        "openalex": {
          "anchorRecall": 0,
          "count": 20,
          "eligible": 5,
          "firstResult": {
            "doi": "10.1038/s41591-018-0134-3",
            "pmid": "30082870",
            "title": "Blood-based tumor mutational burden as a predictor of clinical benefit in non-small-cell lung cancer patients treated with atezolizumab",
            "year": "2018"
          },
          "matched": [],
          "statusText": "OpenAlex: kept 20 records after applying the 2015+ floor"
        },
        "pubmed": {
          "anchorRecall": 0,
          "count": 20,
          "eligible": 5,
          "firstResult": {
            "doi": "10.1016/j.intimp.2026.116481",
            "pmid": "41806690",
            "title": "Efficacy and safety of a low-dose nivolumab regimen (240\u00a0mg) as neoadjuvant immunochemotherapy in Chinese patients with resectable non-small cell lung cancer: a prospective single-arm, exploratory study.",
            "year": "2026"
          },
          "matched": [],
          "statusText": "3595 total results (PubMed: 20)"
        }
      },
      "status": "warn",
      "topicId": "nsclc_immunotherapy_os",
      "validationPackId": null,
      "id": "nsclc_immunotherapy_os"
    },
    "nsclc_immunotherapy_pfs": {
      "category": "Oncology",
      "extraction": {
        "ctgov": {
          "has2x2": false,
          "hasReportedEffect": false,
          "hasResults": true,
          "matchScore": 57,
          "matchedOutcome": "Progression-free Survival (PFS) in the TC3 or IC3-WT Populations",
          "recordExtract": "Progression-free Survival (PFS) in the TC3 or IC3-WT Populations | Tx --/-- vs Ctrl --/--",
          "sampleNctId": "NCT02409342",
          "success": false
        },
        "pubmed": {
          "effectCount": 1,
          "firstExtract": "hazard ratio = 0.36, 95% CI: 0.14-0.92",
          "pmid": "41690366",
          "success": true,
          "title": "Four-Year Outcomes of First-Line Nivolumab Plus Ipilimumab for 6 Months Versus Continuation in Patients With Advanced NSCLC: Results of the Randomized IFCT-1701 \"DICIPLE\" Phase III Trial."
        }
      },
      "failReasons": [
        "ctgov_anchor_recall",
        "ctgov_extract"
      ],
      "name": "Checkpoint immunotherapy in NSCLC - Progression-free survival",
      "policy": {
        "allowedSources": [
          "ctgov",
          "pubmed",
          "openalex"
        ],
        "extractionMode": "pubmed-abstract-and-ctgov-records-only",
        "pass": true,
        "pdfUploadHidden": true,
        "pdfViewerHidden": true,
        "yearFloor": 2015
      },
      "screening": {
        "humanCheckable": true,
        "recordsWithAnchors": 0
      },
      "search": {
        "ctgov": {
          "anchorRecall": 0,
          "count": 20,
          "eligible": 5,
          "firstResult": {
            "nctId": "NCT02949843",
            "title": "Phase II Pilot Study Evaluating Strategies to Overcome Resistance at the Time of Progression for Patients With Non-small Cell Lung Cancers Harboring Major Oncogenic Drivers",
            "year": "2017"
          },
          "matched": [],
          "statusText": "CT.gov: kept 20 trials after applying the 2015+ floor"
        },
        "openalex": {
          "anchorRecall": 0,
          "count": 20,
          "eligible": 5,
          "firstResult": {
            "doi": "10.1038/s41591-018-0134-3",
            "pmid": "30082870",
            "title": "Blood-based tumor mutational burden as a predictor of clinical benefit in non-small-cell lung cancer patients treated with atezolizumab",
            "year": "2018"
          },
          "matched": [],
          "statusText": "OpenAlex: kept 20 records after applying the 2015+ floor"
        },
        "pubmed": {
          "anchorRecall": 0,
          "count": 20,
          "eligible": 5,
          "firstResult": {
            "doi": "10.1016/j.intimp.2026.116481",
            "pmid": "41806690",
            "title": "Efficacy and safety of a low-dose nivolumab regimen (240\u00a0mg) as neoadjuvant immunochemotherapy in Chinese patients with resectable non-small cell lung cancer: a prospective single-arm, exploratory study.",
            "year": "2026"
          },
          "matched": [],
          "statusText": "3655 total results (PubMed: 20)"
        }
      },
      "status": "warn",
      "topicId": "nsclc_immunotherapy_pfs",
      "validationPackId": null,
      "id": "nsclc_immunotherapy_pfs"
    },
    "nsclc_immunotherapy_pdl1": {
      "category": "Oncology",
      "extraction": {
        "ctgov": {
          "has2x2": false,
          "hasReportedEffect": false,
          "hasResults": true,
          "matchScore": 69,
          "matchedOutcome": "Overall Survival (OS) in the TC3 or IC3-WT Populations",
          "recordExtract": "Overall Survival (OS) in the TC3 or IC3-WT Populations | Tx --/-- vs Ctrl --/--",
          "sampleNctId": "NCT02409342",
          "success": false
        },
        "pubmed": {
          "effectCount": 1,
          "firstExtract": "hazard ratio = 0.36, 95% CI: 0.14-0.92",
          "pmid": "41690366",
          "success": true,
          "title": "Four-Year Outcomes of First-Line Nivolumab Plus Ipilimumab for 6 Months Versus Continuation in Patients With Advanced NSCLC: Results of the Randomized IFCT-1701 \"DICIPLE\" Phase III Trial."
        }
      },
      "failReasons": [
        "ctgov_anchor_recall",
        "ctgov_extract"
      ],
      "name": "Checkpoint immunotherapy in NSCLC - High PD-L1 subgroup",
      "policy": {
        "allowedSources": [
          "ctgov",
          "pubmed",
          "openalex"
        ],
        "extractionMode": "pubmed-abstract-and-ctgov-records-only",
        "pass": true,
        "pdfUploadHidden": true,
        "pdfViewerHidden": true,
        "yearFloor": 2015
      },
      "screening": {
        "humanCheckable": true,
        "recordsWithAnchors": 0
      },
      "search": {
        "ctgov": {
          "anchorRecall": 0,
          "count": 20,
          "eligible": 5,
          "firstResult": {
            "nctId": "NCT02949843",
            "title": "Phase II Pilot Study Evaluating Strategies to Overcome Resistance at the Time of Progression for Patients With Non-small Cell Lung Cancers Harboring Major Oncogenic Drivers",
            "year": "2017"
          },
          "matched": [],
          "statusText": "CT.gov: kept 20 trials after applying the 2015+ floor"
        },
        "openalex": {
          "anchorRecall": 0,
          "count": 20,
          "eligible": 5,
          "firstResult": {
            "doi": "10.1038/s41591-018-0134-3",
            "pmid": "30082870",
            "title": "Blood-based tumor mutational burden as a predictor of clinical benefit in non-small-cell lung cancer patients treated with atezolizumab",
            "year": "2018"
          },
          "matched": [],
          "statusText": "OpenAlex: kept 20 records after applying the 2015+ floor"
        },
        "pubmed": {
          "anchorRecall": 0,
          "count": 20,
          "eligible": 5,
          "firstResult": {
            "doi": "10.1016/j.intimp.2026.116481",
            "pmid": "41806690",
            "title": "Efficacy and safety of a low-dose nivolumab regimen (240\u00a0mg) as neoadjuvant immunochemotherapy in Chinese patients with resectable non-small cell lung cancer: a prospective single-arm, exploratory study.",
            "year": "2026"
          },
          "matched": [],
          "statusText": "3715 total results (PubMed: 20)"
        }
      },
      "status": "warn",
      "topicId": "nsclc_immunotherapy_pdl1",
      "validationPackId": null,
      "id": "nsclc_immunotherapy_pdl1"
    },
    "pah_novel_worsening": {
      "category": "Pulmonary Hypertension",
      "extraction": {
        "ctgov": {
          "has2x2": false,
          "hasReportedEffect": false,
          "hasResults": true,
          "matchScore": 33,
          "matchedOutcome": "Time to First Confirmed Morbidity or Mortality Event",
          "recordExtract": "Time to First Confirmed Morbidity or Mortality Event | Tx --/-- vs Ctrl --/--",
          "sampleNctId": "NCT04896008",
          "success": false
        },
        "pubmed": {
          "effectCount": 1,
          "firstExtract": "HR = 0.45; 95% CI 0.29-0.70",
          "pmid": "41727799",
          "success": true,
          "title": "Sotatercept Versus Selexipag in Severe Pulmonary Arterial Hypertension: An Indirect Comparison of Efficacy Based on an Artificial-Intelligence Method That Reconstructed Patient-Level Data From Three Randomized Trials."
        }
      },
      "failReasons": [
        "ctgov_extract"
      ],
      "name": "Novel therapies in pulmonary arterial hypertension - Clinical worsening",
      "policy": {
        "allowedSources": [
          "ctgov",
          "pubmed",
          "openalex"
        ],
        "extractionMode": "pubmed-abstract-and-ctgov-records-only",
        "pass": true,
        "pdfUploadHidden": true,
        "pdfViewerHidden": true,
        "yearFloor": 2015
      },
      "screening": {
        "humanCheckable": true,
        "recordsWithAnchors": 2
      },
      "search": {
        "ctgov": {
          "anchorRecall": 0.6666666666666666,
          "count": 18,
          "eligible": 3,
          "firstResult": {
            "nctId": "NCT07356778",
            "title": "An Open-label, Randomized, Controlled Trial to Evaluate the Efficacy of Sotatercept Add-on Therapy Compared to Standard PAH Therapy With Pulmonary Vasodilators for Pulmonary Arterial Hypertension Associated With Pulmonary Vasodilator-resistant, Unrepaired Congenital Shunts (ASD, VSD, PDA) Including Eisenmenger Syndrome\uff1aSuMILE Trial",
            "year": "2025"
          },
          "matched": [
            "NCT04576988",
            "NCT04896008"
          ],
          "statusText": "CT.gov: kept 18 trials after applying the 2015+ floor"
        },
        "openalex": {
          "anchorRecall": 0,
          "count": 20,
          "eligible": 3,
          "firstResult": {
            "doi": "10.1183/13993003.00879-2022",
            "pmid": "36028254",
            "title": "2022 ESC/ERS Guidelines for the diagnosis and treatment of pulmonary hypertension",
            "year": "2022"
          },
          "matched": [],
          "statusText": "OpenAlex: kept 20 records after applying the 2015+ floor"
        },
        "pubmed": {
          "anchorRecall": 1,
          "count": 20,
          "eligible": 3,
          "firstResult": {
            "doi": "10.7759/cureus.c411",
            "pmid": "41798658",
            "title": "Correction: Sotatercept Versus Selexipag in Severe Pulmonary Arterial Hypertension: An Indirect Comparison of Efficacy Based on an Artificial-Intelligence Method That Reconstructed Patient-Level Data From Three Randomized Trials.",
            "year": "2026"
          },
          "matched": [
            "NCT01106014",
            "NCT04576988",
            "NCT04896008"
          ],
          "statusText": "3773 total results (PubMed: 20)"
        }
      },
      "status": "warn",
      "topicId": "pah_novel_worsening",
      "validationPackId": null,
      "id": "pah_novel_worsening"
    },
    "pah_novel_exercise": {
      "category": "Pulmonary Hypertension",
      "extraction": {
        "ctgov": {
          "has2x2": false,
          "hasReportedEffect": false,
          "hasResults": true,
          "matchScore": 15,
          "matchedOutcome": "Time to First Confirmed Morbidity or Mortality Event",
          "recordExtract": "Time to First Confirmed Morbidity or Mortality Event | Tx --/-- vs Ctrl --/--",
          "sampleNctId": "NCT04896008",
          "success": false
        },
        "pubmed": {
          "effectCount": 1,
          "firstExtract": "HR = 0.45; 95% CI 0.29-0.70",
          "pmid": "41727799",
          "success": true,
          "title": "Sotatercept Versus Selexipag in Severe Pulmonary Arterial Hypertension: An Indirect Comparison of Efficacy Based on an Artificial-Intelligence Method That Reconstructed Patient-Level Data From Three Randomized Trials."
        }
      },
      "failReasons": [
        "ctgov_extract"
      ],
      "name": "Novel therapies in pulmonary arterial hypertension - Exercise capacity",
      "policy": {
        "allowedSources": [
          "ctgov",
          "pubmed",
          "openalex"
        ],
        "extractionMode": "pubmed-abstract-and-ctgov-records-only",
        "pass": true,
        "pdfUploadHidden": true,
        "pdfViewerHidden": true,
        "yearFloor": 2015
      },
      "screening": {
        "humanCheckable": true,
        "recordsWithAnchors": 2
      },
      "search": {
        "ctgov": {
          "anchorRecall": 0.6666666666666666,
          "count": 18,
          "eligible": 3,
          "firstResult": {
            "nctId": "NCT07356778",
            "title": "An Open-label, Randomized, Controlled Trial to Evaluate the Efficacy of Sotatercept Add-on Therapy Compared to Standard PAH Therapy With Pulmonary Vasodilators for Pulmonary Arterial Hypertension Associated With Pulmonary Vasodilator-resistant, Unrepaired Congenital Shunts (ASD, VSD, PDA) Including Eisenmenger Syndrome\uff1aSuMILE Trial",
            "year": "2025"
          },
          "matched": [
            "NCT04576988",
            "NCT04896008"
          ],
          "statusText": "CT.gov: kept 18 trials after applying the 2015+ floor"
        },
        "openalex": {
          "anchorRecall": 0,
          "count": 20,
          "eligible": 3,
          "firstResult": {
            "doi": "10.1183/13993003.00879-2022",
            "pmid": "36028254",
            "title": "2022 ESC/ERS Guidelines for the diagnosis and treatment of pulmonary hypertension",
            "year": "2022"
          },
          "matched": [],
          "statusText": "OpenAlex: kept 20 records after applying the 2015+ floor"
        },
        "pubmed": {
          "anchorRecall": 1,
          "count": 20,
          "eligible": 3,
          "firstResult": {
            "doi": "10.7759/cureus.c411",
            "pmid": "41798658",
            "title": "Correction: Sotatercept Versus Selexipag in Severe Pulmonary Arterial Hypertension: An Indirect Comparison of Efficacy Based on an Artificial-Intelligence Method That Reconstructed Patient-Level Data From Three Randomized Trials.",
            "year": "2026"
          },
          "matched": [
            "NCT01106014",
            "NCT04576988",
            "NCT04896008"
          ],
          "statusText": "3831 total results (PubMed: 20)"
        }
      },
      "status": "warn",
      "topicId": "pah_novel_exercise",
      "validationPackId": null,
      "id": "pah_novel_exercise"
    },
    "hcm_myosin_symptoms": {
      "category": "Structural Heart Disease",
      "extraction": {
        "ctgov": {
          "has2x2": false,
          "hasReportedEffect": false,
          "hasResults": true,
          "matchScore": 15,
          "matchedOutcome": "Incidence of Adverse Events (AEs)",
          "recordExtract": "Incidence of Adverse Events (AEs) | Tx --/-- vs Ctrl --/--",
          "sampleNctId": "NCT04219826",
          "success": false
        },
        "pubmed": {
          "effectCount": 3,
          "firstExtract": "MD: -18.15, 95% CI: -32.65 to -3.65",
          "pmid": "41659081",
          "success": true,
          "title": "Effect of Cardiac Myosin Inhibitors on Echocardiographic Features of Cardiac Structure and Function in Hypertrophic Cardiomyopathy: A Systematic Review and Meta-Analysis."
        }
      },
      "failReasons": [
        "ctgov_extract"
      ],
      "name": "Cardiac myosin inhibition in hypertrophic cardiomyopathy - Symptoms and functional class",
      "policy": {
        "allowedSources": [
          "ctgov",
          "pubmed",
          "openalex"
        ],
        "extractionMode": "pubmed-abstract-and-ctgov-records-only",
        "pass": true,
        "pdfUploadHidden": true,
        "pdfViewerHidden": true,
        "yearFloor": 2015
      },
      "screening": {
        "humanCheckable": true,
        "recordsWithAnchors": 1
      },
      "search": {
        "ctgov": {
          "anchorRecall": 0.3333333333333333,
          "count": 20,
          "eligible": 3,
          "firstResult": {
            "nctId": "NCT07107373",
            "title": "MavAcamten Real World eVidEnce coLlaboration in HCM (MARVEL-HCM)",
            "year": "2023"
          },
          "matched": [
            "NCT03470545"
          ],
          "statusText": "CT.gov: kept 20 trials after applying the 2015+ floor"
        },
        "openalex": {
          "anchorRecall": 0.3333333333333333,
          "count": 20,
          "eligible": 3,
          "firstResult": {
            "doi": "10.1016/j.cardfail.2023.07.003",
            "pmid": "37473912",
            "title": "Aficamten for Drug-Refractory Severe Obstructive Hypertrophic Cardiomyopathy in Patients Receiving Disopyramide: REDWOOD-HCM Cohort 3",
            "year": "2023"
          },
          "matched": [
            "NCT04219826"
          ],
          "statusText": "OpenAlex: kept 20 records after applying the 2015+ floor"
        },
        "pubmed": {
          "anchorRecall": 0.6666666666666666,
          "count": 20,
          "eligible": 3,
          "firstResult": {
            "doi": "10.1111/cts.70514",
            "pmid": "41784061",
            "title": "Clinical Evaluation of Drug-Drug Interactions With Aficamten.",
            "year": "2026"
          },
          "matched": [
            "NCT03470545",
            "NCT04349072"
          ],
          "statusText": "3891 total results (PubMed: 20)"
        }
      },
      "status": "warn",
      "topicId": "hcm_myosin_symptoms",
      "validationPackId": null,
      "id": "hcm_myosin_symptoms"
    },
    "hcm_myosin_lvot": {
      "category": "Structural Heart Disease",
      "extraction": {
        "ctgov": {
          "has2x2": false,
          "hasReportedEffect": false,
          "hasResults": true,
          "matchScore": 63,
          "matchedOutcome": "Slope of the Relationship of the Plasma Concentration of CK-3773274 to the Change From Baseline in the Resting Left Ventricular Outflow Track Gradient (LVOT-G)",
          "recordExtract": "Slope of the Relationship of the Plasma Concentration of CK-3773274 to the Change From Baseline in the Resting Left Ventricular Outflow Track Gradient (LVOT-G) | Tx --/-- vs Ctrl --/--",
          "sampleNctId": "NCT04219826",
          "success": false
        },
        "pubmed": {
          "effectCount": 3,
          "firstExtract": "MD: -18.15, 95% CI: -32.65 to -3.65",
          "pmid": "41659081",
          "success": true,
          "title": "Effect of Cardiac Myosin Inhibitors on Echocardiographic Features of Cardiac Structure and Function in Hypertrophic Cardiomyopathy: A Systematic Review and Meta-Analysis."
        }
      },
      "failReasons": [
        "ctgov_extract"
      ],
      "name": "Cardiac myosin inhibition in hypertrophic cardiomyopathy - LVOT gradient",
      "policy": {
        "allowedSources": [
          "ctgov",
          "pubmed",
          "openalex"
        ],
        "extractionMode": "pubmed-abstract-and-ctgov-records-only",
        "pass": true,
        "pdfUploadHidden": true,
        "pdfViewerHidden": true,
        "yearFloor": 2015
      },
      "screening": {
        "humanCheckable": true,
        "recordsWithAnchors": 1
      },
      "search": {
        "ctgov": {
          "anchorRecall": 0.3333333333333333,
          "count": 20,
          "eligible": 3,
          "firstResult": {
            "nctId": "NCT07107373",
            "title": "MavAcamten Real World eVidEnce coLlaboration in HCM (MARVEL-HCM)",
            "year": "2023"
          },
          "matched": [
            "NCT03470545"
          ],
          "statusText": "CT.gov: kept 20 trials after applying the 2015+ floor"
        },
        "openalex": {
          "anchorRecall": 0.3333333333333333,
          "count": 20,
          "eligible": 3,
          "firstResult": {
            "doi": "10.1016/j.cardfail.2023.07.003",
            "pmid": "37473912",
            "title": "Aficamten for Drug-Refractory Severe Obstructive Hypertrophic Cardiomyopathy in Patients Receiving Disopyramide: REDWOOD-HCM Cohort 3",
            "year": "2023"
          },
          "matched": [
            "NCT04219826"
          ],
          "statusText": "OpenAlex: kept 20 records after applying the 2015+ floor"
        },
        "pubmed": {
          "anchorRecall": 0.6666666666666666,
          "count": 20,
          "eligible": 3,
          "firstResult": {
            "doi": "10.1111/cts.70514",
            "pmid": "41784061",
            "title": "Clinical Evaluation of Drug-Drug Interactions With Aficamten.",
            "year": "2026"
          },
          "matched": [
            "NCT03470545",
            "NCT04349072"
          ],
          "statusText": "3951 total results (PubMed: 20)"
        }
      },
      "status": "warn",
      "topicId": "hcm_myosin_lvot",
      "validationPackId": null,
      "id": "hcm_myosin_lvot"
    }
  }
};
})();
