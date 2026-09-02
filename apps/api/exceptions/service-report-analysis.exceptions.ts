import { BadRequest, NotFound, ServiceUnavailable } from '@tsed/exceptions';

export class ReportAnalyzerNotConfiguredException extends ServiceUnavailable {
  readonly _code = 'REPORT_ANALYZER_NOT_CONFIGURED';

  constructor() {
    super('Service report analyzer is not configured');
  }
}

export class ReportFileNotFoundException extends BadRequest {
  readonly _code = 'REPORT_FILE_NOT_FOUND';

  constructor() {
    super('Uploaded file could not be found — upload it first via /s3');
  }
}

export class ReportAnalysisNotFoundException extends NotFound {
  readonly _code = 'REPORT_ANALYSIS_NOT_FOUND';

  constructor(id: string) {
    super(`Report analysis ${id} not found`);
  }
}
