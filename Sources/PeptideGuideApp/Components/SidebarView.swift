import SwiftUI

struct SidebarView: View {
    @EnvironmentObject private var store: AppStore

    private var selection: Binding<SidebarItem?> {
        Binding(
            get: { store.selectedSidebarItem },
            set: { value in
                guard let value else { return }
                store.selectSidebarItem(value)
            }
        )
    }

    var body: some View {
        List(selection: selection) {
            Section {
                row("Home", systemImage: "house", item: .home)
                row("Explore", systemImage: "magnifyingglass", item: .explore)
                row("Compare", systemImage: "square.split.2x2", item: .compare)
                row("Saved", systemImage: "bookmark", item: .saved)
            } header: {
                sectionHeader("Library")
            }

            Section {
                ForEach(CompoundCategory.allCases) { category in
                    row(category.title, systemImage: category.icon, item: .lane(category))
                }
            } header: {
                sectionHeader("Lanes")
            }

            Section {
                row("Preferences", systemImage: "gearshape", item: .preferences)
            } header: {
                sectionHeader("Settings")
            }
        }
        .listStyle(.sidebar)
        .scrollContentBackground(.hidden)
        .background(AppColors.sidebarBackground)
    }

    @ViewBuilder
    private func row(_ title: String, systemImage: String, item: SidebarItem) -> some View {
        let isSelected = store.selectedSidebarItem == item

        Label {
            Text(title)
                .font(.system(size: 14, weight: isSelected ? .semibold : .medium))
        } icon: {
            Image(systemName: systemImage)
                .font(.system(size: 13, weight: .semibold))
        }
        .foregroundStyle(isSelected ? Color.white : AppColors.sidebarText)
        .padding(.vertical, 4)
            .tag(item)
    }

    private func sectionHeader(_ title: String) -> some View {
        Text(title)
            .font(.system(size: 11, weight: .semibold))
            .textCase(.uppercase)
            .foregroundStyle(AppColors.sidebarSection)
    }
}
