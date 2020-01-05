interface MozjpegOptions {
	quality: number;
	baseline: boolean;
	arithmetic: boolean;
	progressive: boolean;
	optimize_coding: boolean;
	smoothing: number;
	color_space: MozJpegColorSpace;
	quant_table: number;
	trellis_multipass: boolean;
	trellis_opt_zero: boolean;
	trellis_opt_table: boolean;
	trellis_loops: number;
	auto_subsample: boolean;
	chroma_subsample: number;
	separate_chroma_quality: boolean;
	chroma_quality: number;
}

interface OptipngOptions {
	level: 2;
}

interface FetchOpt {
	url: string;
	method: string;
	async?: boolean;
	headers: {[key: string]: string | string[]};
	body?: BodyInit;
	withCredentials: boolean;
	timeout?: number;
	username?: string;
	password?: string;
	responseType?: XMLHttpRequestResponseType;
	onUploadProgress?: (this: XMLHttpRequest, ev: ProgressEvent) => any;
	onDownloadProgress?: (this: XMLHttpRequest, ev: ProgressEvent) => any;
	cancelToken: (xhr: XMLHttpRequest) => any;
	onreadystatechange?: (this: XMLHttpRequest, ev: Event) => any;
	i18?: {timeout: string; error: string; abort: string};
}

type FetchRes = ApiRes | AjaxRes;

interface AjaxRes {
	data: string;
	status: number;
	statusText: string;
	headers: {[key: string]: string | string[]};
}

interface ApiRes {
	no: number;
	msg?: string;
	data: any;
}

type FetchMiddle = (config: FetchOpt, next: FetchMiddle) => Promise<FetchRes>;

interface MessageConfig {
	successText: string;
	failureText: string;
	text:        string;
	title:       string;
	titleClass:  string;
	input:       boolean;
}

interface FormConfig<T> {
	title?:       string;
	successText?: string;
	successColor?: string;
	failureText?: string;
	failureColor?: string;
	params: T;
	value: {[key in T]:any};
	pretreat?: (body: {[key in T]:any}) => any;
	check?: (body: {[key in T]: any}) => string;
}