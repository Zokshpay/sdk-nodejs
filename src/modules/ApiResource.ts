import { Connector } from "../connector";

export class ApiResource {
  connector: Connector;

  /**
   * conn: Connector - API requester, which handles signing of requests
   * */
  constructor(conn: Connector) {
    this.connector = conn;
  }
}
