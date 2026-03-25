import Foundation

enum LaunchScreenOption: String, CaseIterable, Identifiable {
    case home
    case explore
    case compare
    case saved

    var id: String { rawValue }

    var title: String {
        rawValue.capitalized
    }

    var sidebarItem: SidebarItem {
        switch self {
        case .home: .home
        case .explore: .explore
        case .compare: .compare
        case .saved: .saved
        }
    }
}

enum ReadingDensity: String, CaseIterable, Identifiable {
    case comfortable
    case compact

    var id: String { rawValue }

    var title: String {
        rawValue.capitalized
    }
}

enum CompoundSortOption: String, CaseIterable, Identifiable {
    case alphabetical
    case recentlyViewed
    case savedFirst

    var id: String { rawValue }

    var title: String {
        switch self {
        case .alphabetical: "Alphabetical"
        case .recentlyViewed: "Recently Viewed"
        case .savedFirst: "Saved First"
        }
    }
}
