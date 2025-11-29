// BOM Precis Forecast Feeds - State Level
// These are 7-day Precis forecasts covering all locations within each state/territory
export const BOM_STATE_FEEDS = [
    {
        name: "NSW/ACT",
        productId: "IDN11060",
        precip_url: "https://www.bom.gov.au/fwo/IDN11060.xml",
        warning_url: "https://www.bom.gov.au/fwo/IDZ00054.warnings_nsw.xml",
        region: "New South Wales"
    },
    {
        name: "Victoria",
        productId: "IDV10753",
        precip_url: "https://www.bom.gov.au/fwo/IDV10753.xml",
        warning_url: "https://www.bom.gov.au/fwo/IDZ00059.warnings_vic.xml",
        region: "Victoria"
    },
    {
        name: "South Australia",
        productId: "IDS10044",
        precip_url: "https://www.bom.gov.au/fwo/IDS10044.xml",
        warning_url: "https://www.bom.gov.au/fwo/IDZ00057.warnings_sa.xml",
        region: "South Australia"
    },
    {
        name: "Queensland",
        productId: "IDQ11295",
        precip_url: "https://www.bom.gov.au/fwo/IDQ11295.xml",
        warning_url: "https://www.bom.gov.au/fwo/IDZ00056.warnings_qld.xml",
        region: "Queensland"
    },
    {
        name: "Western Australia",
        productId: "IDW14199",
        precip_url: "https://www.bom.gov.au/fwo/IDW14199.xml",
        warning_url: "https://www.bom.gov.au/fwo/IDZ00060.warnings_wa.xml",
        region: "Western Australia"
    },
    {
        name: "Tasmania",
        productId: "IDT16710",
        precip_url: "https://www.bom.gov.au/fwo/IDT16710.xml",
        warning_url: "https://www.bom.gov.au/fwo/IDZ00058.warnings_tas.xml",
        region: "Tasmania"
    },
    {
        name: "Northern Territory",
        productId: "IDD10207",
        precip_url: "https://www.bom.gov.au/fwo/IDD10207.xml",
        warning_url: "https://www.bom.gov.au/fwo/IDZ00055.warnings_nt.xml",
        region: "Northern Territory"
    }
];
