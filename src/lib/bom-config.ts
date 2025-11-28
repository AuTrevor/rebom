export const BOM_CITY_FEEDS = [
    { name: "Sydney", url: "http://www.bom.gov.au/fwo/IDN11050.xml" },
    { name: "Melbourne", url: "http://www.bom.gov.au/fwo/IDV10751.xml" },
    { name: "Brisbane", url: "http://www.bom.gov.au/fwo/IDQ10605.xml" },
    { name: "Perth", url: "http://www.bom.gov.au/fwo/IDW12400.xml" },
    { name: "Adelaide", url: "http://www.bom.gov.au/fwo/IDS10037.xml" },
    { name: "Hobart", url: "http://www.bom.gov.au/fwo/IDT13630.xml" },
    { name: "Canberra", url: "http://www.bom.gov.au/fwo/IDN11060.xml" }, // ACT often covered by NSW feeds, checking IDN11060 (Town) or IDN11050 (City). Using IDN11060 as discovered.
    { name: "Darwin", url: "http://www.bom.gov.au/fwo/IDD10207.xml" }
];
