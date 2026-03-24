/**
 * Validate command - Validate input data format
 */

import chalk from 'chalk';
import { loadData } from '../utils/data-loader';

interface ValidateOptions {
  strict?: boolean;
}

export async function validateCommand(file: string, options: ValidateOptions): Promise<void> {
  console.log(chalk.cyan(`\nValidating: ${file}`));
  console.log('─'.repeat(50));

  const errors: string[] = [];
  const warnings: string[] = [];
  let data: any[];

  try {
    data = await loadData(file);
  } catch (error) {
    console.log(chalk.red('✗ Failed to load file'));
    console.error(chalk.red(`  ${(error as Error).message}`));
    process.exit(1);
  }

  console.log(chalk.green(`✓ File loaded successfully`));
  console.log(`  Records found: ${data.length}`);

  if (data.length === 0) {
    errors.push('No data records found in file');
  }

  // Check data format
  if (data.length > 0) {
    const firstRow = data[0];
    const hasEffectSize = 'yi' in firstRow && 'vi' in firstRow;
    const hasBinary = 'events1' in firstRow && 'total1' in firstRow;
    const hasContinuous = 'mean1' in firstRow && 'sd1' in firstRow && 'n1' in firstRow;

    if (hasEffectSize) {
      console.log(chalk.green('✓ Detected format: Pre-calculated effect sizes'));
      validateEffectSizeData(data, errors, warnings, options.strict);
    } else if (hasBinary) {
      console.log(chalk.green('✓ Detected format: Binary outcome data'));
      validateBinaryData(data, errors, warnings, options.strict);
    } else if (hasContinuous) {
      console.log(chalk.green('✓ Detected format: Continuous outcome data'));
      validateContinuousData(data, errors, warnings, options.strict);
    } else {
      errors.push('Unable to detect data format. Expected effect sizes (yi, vi), binary (events1, total1, events2, total2), or continuous (mean1, sd1, n1, mean2, sd2, n2)');
    }
  }

  // Report results
  console.log('\n' + '─'.repeat(50));

  if (errors.length === 0 && warnings.length === 0) {
    console.log(chalk.green.bold('✓ Validation passed - No issues found'));
    process.exit(0);
  }

  if (warnings.length > 0) {
    console.log(chalk.yellow(`\n⚠ ${warnings.length} Warning(s):`));
    warnings.forEach((w, i) => console.log(chalk.yellow(`  ${i + 1}. ${w}`)));
  }

  if (errors.length > 0) {
    console.log(chalk.red(`\n✗ ${errors.length} Error(s):`));
    errors.forEach((e, i) => console.log(chalk.red(`  ${i + 1}. ${e}`)));
    process.exit(1);
  }

  process.exit(0);
}

function validateEffectSizeData(
  data: any[],
  errors: string[],
  warnings: string[],
  strict?: boolean
): void {
  data.forEach((row, i) => {
    const rowNum = i + 1;

    // Required fields
    if (typeof row.yi !== 'number' || isNaN(row.yi)) {
      errors.push(`Row ${rowNum}: Invalid or missing 'yi' (effect size)`);
    }

    if (typeof row.vi !== 'number' || isNaN(row.vi)) {
      errors.push(`Row ${rowNum}: Invalid or missing 'vi' (variance)`);
    } else if (row.vi <= 0) {
      errors.push(`Row ${rowNum}: Variance 'vi' must be positive (got ${row.vi})`);
    }

    // Optional but recommended
    if (strict && !row.study && !row.id) {
      warnings.push(`Row ${rowNum}: No study identifier provided`);
    }

    // Check for extreme values
    if (Math.abs(row.yi) > 10) {
      warnings.push(`Row ${rowNum}: Effect size may be extreme (yi = ${row.yi})`);
    }
  });
}

function validateBinaryData(
  data: any[],
  errors: string[],
  warnings: string[],
  strict?: boolean
): void {
  data.forEach((row, i) => {
    const rowNum = i + 1;

    // Required fields
    ['events1', 'total1', 'events2', 'total2'].forEach(field => {
      if (typeof row[field] !== 'number' || isNaN(row[field])) {
        errors.push(`Row ${rowNum}: Invalid or missing '${field}'`);
      } else if (row[field] < 0) {
        errors.push(`Row ${rowNum}: '${field}' cannot be negative`);
      } else if (!Number.isInteger(row[field])) {
        warnings.push(`Row ${rowNum}: '${field}' should be an integer`);
      }
    });

    // Logical checks
    if (row.events1 > row.total1) {
      errors.push(`Row ${rowNum}: events1 (${row.events1}) cannot exceed total1 (${row.total1})`);
    }
    if (row.events2 > row.total2) {
      errors.push(`Row ${rowNum}: events2 (${row.events2}) cannot exceed total2 (${row.total2})`);
    }

    // Zero cell check
    if (row.events1 === 0 || row.events2 === 0 ||
        row.events1 === row.total1 || row.events2 === row.total2) {
      warnings.push(`Row ${rowNum}: Contains zero cells (continuity correction will be applied)`);
    }

    // Sample size warnings
    if (strict && (row.total1 < 10 || row.total2 < 10)) {
      warnings.push(`Row ${rowNum}: Very small sample size`);
    }
  });
}

function validateContinuousData(
  data: any[],
  errors: string[],
  warnings: string[],
  strict?: boolean
): void {
  data.forEach((row, i) => {
    const rowNum = i + 1;

    // Required fields
    ['mean1', 'sd1', 'n1', 'mean2', 'sd2', 'n2'].forEach(field => {
      if (typeof row[field] !== 'number' || isNaN(row[field])) {
        errors.push(`Row ${rowNum}: Invalid or missing '${field}'`);
      }
    });

    // SD must be positive
    if (row.sd1 <= 0) {
      errors.push(`Row ${rowNum}: sd1 must be positive (got ${row.sd1})`);
    }
    if (row.sd2 <= 0) {
      errors.push(`Row ${rowNum}: sd2 must be positive (got ${row.sd2})`);
    }

    // N must be positive integer
    if (row.n1 <= 0 || !Number.isInteger(row.n1)) {
      errors.push(`Row ${rowNum}: n1 must be a positive integer (got ${row.n1})`);
    }
    if (row.n2 <= 0 || !Number.isInteger(row.n2)) {
      errors.push(`Row ${rowNum}: n2 must be a positive integer (got ${row.n2})`);
    }

    // Sample size warnings
    if (strict && (row.n1 < 10 || row.n2 < 10)) {
      warnings.push(`Row ${rowNum}: Very small sample size`);
    }
  });
}
