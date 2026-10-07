export const normalizeChecklistData = (
    data
) => {
    if (!data) {
        return data;
    }

    return {
        ...data,

        siteInformation: {
            ...data.siteInformation,

            province:
                data?.siteInformation?.province ??
                data?.siteInformation?.county ??
                "",

            city:
                data?.siteInformation?.city ??
                "",

            department:
                data?.siteInformation?.department ??
                "",

            site:
                data?.siteInformation?.site ??
                "",
        },
    };
};