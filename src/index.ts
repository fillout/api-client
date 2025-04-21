import { FilloutForm, FilloutFormTag, FilloutSubmission } from "./types.js";

const TOKEN_PREFIXES = ["sk_prod_", "fillout_token_"];

function isValidToken(token: string) {
  return TOKEN_PREFIXES.some((prefix) => token.startsWith(prefix));
}

export class Fillout {
  private token: string;
  private baseUrl: string;

  constructor(token: string, options?: { region?: "us" | "eu" | "ca" }) {
    if (typeof token !== "string" || !isValidToken(token)) {
      throw new Error(
        "Invalid Fillout API key. Visit https://build.fillout.com/home/settings/developer to create one.",
      );
    }

    const region = options?.region || "us";

    this.token = token;
    this.baseUrl =
      region === "eu"
        ? "https://eu-api.fillout.com"
        : region === "ca"
          ? "https://ca-api.fillout.com"
          : "https://api.fillout.com";
  }

  /** Get all the forms in your organization */
  getForms = async () => {
    const res = await fetch(`${this.baseUrl}/v1/api/forms`, {
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
    });
    if (!res.ok) throw await filloutError("fetch Fillout forms", res);

    const data: {
      formId: string;
      name: string;
      tags: FilloutFormTag[];
    }[] = await res.json();

    return data;
  };

  /**
   * Get the metadata of a form
   * @param formId - The id found in the URL of a form, eg. `foAdHjd1Duus`
   */
  getForm = async (formId: string) => {
    const res = await fetch(
      `${this.baseUrl}/v1/api/forms/${encodeURIComponent(formId)}`,
      {
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      },
    );
    if (!res.ok)
      throw await filloutError(`fetch Fillout form '${formId}'`, res);

    const data: FilloutForm = await res.json();
    return data;
  };

  /**
   * Get form submissions
   * @param formId - The id found in the URL of a form, eg. `foAdHjd1Duus`
   */
  getSubmissions = async (
    formId: string,
    options?: {
      /** The maximum number of submissions to retrieve per request. Must be a number between 1 and 150. Default is 50. */
      limit?: number;
      /** A date string to filter submissions submitted after this date */
      afterDate?: string;
      /** A date string to filter submissions submitted before this date */
      beforeDate?: string;
      /** The starting position from which to fetch the submissions. Default is 0. */
      offset?: number;
      /** Pass `in_progress` to get a list of in-progress (unfinished) submissions. By default, only `finished` submissions are returned. Note that fetching in progress submissions is available starting on the business plan. */
      status?: "in_progress" | "finished";
      /** Pass `true` to include a link to edit the submission as `editLink` */
      includeEditLink?: boolean;
      /** Pass `true` to include preview responses */
      includePreview?: boolean;
      /** Can be `asc` or `desc`, defaults to `asc` */
      sort?: "asc" | "desc";
      /** Filter for submissions containing a string of text */
      search?: string;
    },
  ) => {
    const res = await fetch(
      `${this.baseUrl}/v1/api/forms/${encodeURIComponent(formId)}/submissions?${toURLSearchParams(options || {})}`,
      {
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      },
    );
    if (!res.ok) {
      throw await filloutError(
        `fetch submissions for Fillout form '${formId}'`,
        res,
      );
    }

    const data: {
      responses: FilloutSubmission[];
      totalResponses: number;
      pageCount: number;
    } = await res.json();
    return data;
  };

  /**
   * Get form submission by id
   * @param formId - The id found in the URL of a form, eg. `foAdHjd1Duus`
   * @param submissionId - The uuid of a submission
   */
  getSubmission = async (
    formId: string,
    submissionId: string,
    options?: {
      /** Pass `true` to include a link to edit the submission as `editLink` */
      includeEditLink?: boolean;
    },
  ) => {
    const res = await fetch(
      `${this.baseUrl}/v1/api/forms/${encodeURIComponent(formId)}/submissions/${encodeURIComponent(submissionId)}?${toURLSearchParams(options || {})}`,
      {
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      },
    );
    if (!res.ok) {
      throw await filloutError(
        `fetch Fillout submission '${submissionId}'`,
        res,
      );
    }

    const data: { submission: FilloutSubmission } = await res.json();
    return data.submission;
  };

  /**
   * Delete a form submission by id
   * @param formId - The id found in the URL of a form, eg. `foAdHjd1Duus`
   * @param submissionId - The uuid of a submission
   */
  deleteSubmission = async (formId: string, submissionId: string) => {
    const res = await fetch(
      `${this.baseUrl}/v1/api/forms/${encodeURIComponent(formId)}/submissions/${encodeURIComponent(submissionId)}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      },
    );
    if (!res.ok) {
      throw await filloutError(
        `delete Fillout submission '${submissionId}'`,
        res,
      );
    }
  };

  /**
   * Create a webhook for form submissions
   * @param formId - The id found in the URL of a form, eg. `foAdHjd1Duus`
   * @param url - The endpoint where you’d like to listen for submissions
   */
  createWebhook = async (formId: string, url: string) => {
    const res = await fetch(`${this.baseUrl}/v1/api/webhook/create`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ formId, url }),
    });
    if (!res.ok) throw await filloutError(`create Fillout webhook`, res);

    const data: { id: number } = await res.json();
    return data;
  };

  /**
   * Remove a webhook
   * @param webhookId - The numerical ID you received when creating the webhook
   */
  deleteWebhook = async (webhookId: number) => {
    const res = await fetch(`${this.baseUrl}/v1/api/webhook/delete`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ webhookId }),
    });
    if (!res.ok) {
      throw await filloutError(`delete Fillout webhook ${webhookId}`, res);
    }
  };

  /**
   * Create submissions
   * @param formId - The id found in the URL of a form, eg. `foAdHjd1Duus`
   * @param submissions - The maximum number of submissions that can be created in a single request is 10.
   *
   * See also: https://www.fillout.com/help/fillout-rest-api#951dc79e6b8b476aa808ea670252609d
   */
  createSubmissions = async (
    formId: string,
    submissions: Record<string, any>[],
  ) => {
    const res = await fetch(
      `${this.baseUrl}/v1/api/forms/${encodeURIComponent(formId)}/submissions`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ submissions }),
      },
    );

    if (!res.ok) throw await filloutError(`create Fillout submissions`, res);

    const data: { id: number } = await res.json();
    return data;
  };
}

const filloutError = async (verb: string, res: Response) => {
  const ct = res.headers.get("Content-Type")?.split(";")[0];
  if (ct === "application/json") {
    const body = await res.json();
    if (body.message) return new Error(body.message);
  }

  return new Error(`Failed to ${verb} with status code ${res.status}`);
};

const toURLSearchParams = (body: Record<string, unknown>) => {
  const params = new URLSearchParams();
  Object.entries(body).forEach(([key, value]) => {
    if (value) params.set(key, String(value));
  });
  return params;
};
