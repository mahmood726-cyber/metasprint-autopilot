Mahmood Ahmad
Tahir Heart Institute
author@example.com

MetaSprint Autopilot: Zero-Install Browser Platform for Systematic Review and Meta-Analysis

Can a zero-install browser application match the statistical accuracy of validated meta-analysis software across hundreds of Cochrane reviews? MetaSprint Autopilot is a single HTML file implementing a complete seven-phase systematic review workflow from topic discovery through manuscript drafting, validated against 291 Cochrane reviews via triple-blinded architecture. The engine provides DerSimonian-Laird, REML, Mantel-Haenszel, and Peto pooling with Hartung-Knapp-Sidik-Jonkman intervals, publication bias diagnostics, living meta-analysis with sequential stopping rules, and GRADE assessment. Across all 291 reviews the engine achieved 100.0 percent accuracy with median effect difference of 1.65 times ten to the negative seventh, and R metafor v4.8.0 cross-validation confirmed exact agreement with concordance coefficient of 1.0000. Leave-one-out analysis showed 24.9 percent of reviews changed direction upon single-study removal, and 92.2 percent of prediction intervals crossed the null. The platform eliminates software installation barriers while preserving statistical rigor for global evidence synthesis. However, a limitation is that open-access search discovery rates remain moderate at 58 to 65 percent.

Outside Notes

Type: methods
Primary estimand: Engine accuracy vs Cochrane reviews
App: MetaSprint Autopilot v1.0
Data: 291 Cochrane reviews (triple-blinded validation)
Code: https://github.com/mahmood726-cyber/metasprint-autopilot
Version: 1.0
Validation: DRAFT

References

1. Egger M, Davey Smith G, Schneider M, Minder C. Bias in meta-analysis detected by a simple, graphical test. BMJ. 1997;315(7109):629-634.
2. Duval S, Tweedie R. Trim and fill: a simple funnel-plot-based method of testing and adjusting for publication bias in meta-analysis. Biometrics. 2000;56(2):455-463.
3. Borenstein M, Hedges LV, Higgins JPT, Rothstein HR. Introduction to Meta-Analysis. 2nd ed. Wiley; 2021.
