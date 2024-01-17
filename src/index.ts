export {
  ajaxCall,
  ajaxJsonCall,
  ajaxFormCall,
  ajaxFormFileUpload,
  ajaxFileDownload,
  sendBeacon,
  checkUrlExistence,
  appendParamToRemedyCorsBug
} from './ajax'
export type {AjaxJsonCallOptionsT, AjaxFileDownloadOptionsT} from './ajax'

export {fromString, toString, parseLinkHeader} from './link-header'
export type {LinkName, LinkPathT, LinksT} from './link-header'
