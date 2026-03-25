import SwiftUI

struct ResourceList: View {
    let resources: [ResourceLink]

    @Environment(\.openURL) private var openURL

    var body: some View {
        VStack(alignment: .leading, spacing: AppSpacing.sm) {
            Text("Suggested Resources")
                .font(AppTypography.sectionTitle)
                .foregroundStyle(AppColors.textPrimary)

            ForEach(resources) { resource in
                Button {
                    guard let url = URL(string: resource.url) else { return }
                    openURL(url)
                } label: {
                    HStack {
                        VStack(alignment: .leading, spacing: 4) {
                            Text(resource.title)
                                .foregroundStyle(AppColors.textPrimary)
                            Text(resource.url)
                                .font(AppTypography.meta)
                                .foregroundStyle(AppColors.textSecondary)
                                .lineLimit(1)
                        }
                        Spacer()
                        Image(systemName: "arrow.up.right")
                            .foregroundStyle(AppColors.accent)
                    }
                    .padding(AppSpacing.md)
                    .background(AppColors.secondaryCardBackground)
                    .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
                }
                .buttonStyle(.plain)
            }
        }
    }
}
