import Foundation

enum SidebarItem: Hashable {
    case home
    case explore
    case compare
    case saved
    case preferences
    case lane(CompoundCategory)
}
