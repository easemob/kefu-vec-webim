import Fetcher from "../fetch-middleware/index";
import { StorageGlobals as Globals } from "@kefu/in-state";

export default class TaskOperator {
    private readonly fetcher: Fetcher;

    constructor(apiOrigin: string = "https://api.netless.link/v5", readonly region?: string) {
        this.fetcher = new Fetcher(5000, apiOrigin);
    }

    // public async createPPTTaskInf(pptURL: string, type: string, preview: boolean, sdkToken: string): Promise<any> {
    //     const json = await this.fetcher.post<any>({
    //         path: `services/conversion/tasks`,
    //         headers: JSON.parse(JSON.stringify({
    //             token: sdkToken,
    //             region: this.region,
    //         })),
    //         body: {
    //             resource: pptURL,
    //             type: type,
    //             preview: preview,
    //         },
    //     });
    //     return json as any;
    // }

    public async createPPTTaskInf(pptURL: string, type: string, preview: boolean, sdkToken: string,callId:string): Promise<any> {
        const json = await this.fetcher.post<any>({
            path: `/v1/agorartc/tenant/${Globals.profile.get("tenantId")}/whiteboard/call/{callId}/conversion`,
            
            body: {
                resource: pptURL,
                type: type,
                preview: preview,
            },
        });
        return json as any;
    }

    // roomToken ro sdkToken
    public async getCover(uuid: string, path: string, width: number, height: number, token: string): Promise<any> {
        const json = await this.fetcher.post<any>({
            path: `rooms/${uuid}/screenshots`,
            headers: JSON.parse(JSON.stringify({
                token: token,
                region: this.region,
            })),
            body: {
                path: path,
                width: width,
                height: height
            },
        });
        return json as any;
    }

    public async createTaskToken(taskUuid: string, lifespan: number, role: string, sdkToken: string): Promise<string> {
        const json = await this.fetcher.post<any>({
            path: `tokens/tasks/${taskUuid}`,
            headers: JSON.parse(JSON.stringify({
                token: sdkToken,
                region: this.region,
            })),
            body: {
                lifespan: lifespan,
                role: role,
            },
        });
        return json as string;
    }
}
