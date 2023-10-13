import { processTestCoverage } from './coverage';
import { formatCoverageHtml, formatResultHtml, formatTitleHtml } from './formatting/html';
import { formatCoverageMarkdown, formatResultMarkdown } from './formatting/markdown';
import { processTestResults } from './results';
import { getInputs, publishComment, setFailed, setSummary } from './utils';

const run = async (): Promise<void> => {
  try {
    const {
      token,
      title,
      resultsPath,
      coveragePath,
      coverageType,
      coverageThreshold,
      postNewComment,
      allowFailedTests
    } = getInputs();

    let comment = '';
    let summary = formatTitleHtml(title);

    const testResult = await processTestResults(resultsPath);
    comment += formatResultMarkdown(testResult);
    summary += formatResultHtml(testResult);

    if (coveragePath) {
      const testCoverage = await processTestCoverage(coveragePath, coverageType, coverageThreshold);
      comment += testCoverage ? formatCoverageMarkdown(testCoverage, coverageThreshold) : '';
      summary += testCoverage ? formatCoverageHtml(testCoverage) : '';
    }

    await setSummary(summary);
    await publishComment(token, title, comment, postNewComment);
    !testResult.success && !allowFailedTests && setFailed('Tests Failed');
  } catch (error) {
    setFailed((error as Error).message);
  }
};

run();
