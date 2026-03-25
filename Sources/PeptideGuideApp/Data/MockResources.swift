import Foundation

enum MockResources {
    static func links(for compoundName: String) -> [ResourceLink] {
        let query = compoundName
            .replacingOccurrences(of: " ", with: "+")
            .replacingOccurrences(of: "/", with: "+")

        return [
            ResourceLink(
                id: UUID(),
                title: "PubMed Search",
                url: "https://pubmed.ncbi.nlm.nih.gov/?term=\(query)"
            ),
            ResourceLink(
                id: UUID(),
                title: "ClinicalTrials.gov",
                url: "https://clinicaltrials.gov/search?term=\(query)"
            ),
            ResourceLink(
                id: UUID(),
                title: "Google Scholar Overview",
                url: "https://scholar.google.com/scholar?q=\(query)"
            ),
        ]
    }
}
