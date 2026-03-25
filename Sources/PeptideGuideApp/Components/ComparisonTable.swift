import SwiftUI

struct ComparisonTable: View {
    let compounds: [Compound]

    private var rows: [(String, [String])] {
        [
            ("Primary systems affected", compounds.map(\.primarySystems)),
            ("Appetite effect", compounds.map(\.appetiteEffect)),
            ("Recovery relevance", compounds.map(\.recoveryRelevance)),
            ("Cognitive relevance", compounds.map(\.cognitiveRelevance)),
            ("Energy / mitochondria relevance", compounds.map(\.energyRelevance)),
            ("Research maturity", compounds.map(\.researchMaturity)),
            ("Notable differentiators", compounds.map(\.differentiators)),
        ]
    }

    var body: some View {
        ScrollView([.horizontal, .vertical]) {
            Grid(alignment: .topLeading, horizontalSpacing: AppSpacing.md, verticalSpacing: AppSpacing.sm) {
                GridRow {
                    Color.clear
                    ForEach(compounds) { compound in
                        VStack(alignment: .leading, spacing: 4) {
                            Text(compound.name)
                                .font(.system(size: 16, weight: .semibold))
                                .foregroundStyle(AppColors.textPrimary)
                            Text(compound.categories.map(\.title).joined(separator: " • "))
                                .font(AppTypography.meta)
                                .foregroundStyle(AppColors.textSecondary)
                        }
                        .frame(width: 220, alignment: .leading)
                    }
                }

                Rectangle()
                    .fill(AppColors.border)
                    .frame(height: 1)
                    .gridCellColumns(compounds.count + 1)

                ForEach(rows, id: \.0) { row in
                    ComparisonRow(title: row.0, values: row.1)
                    Rectangle()
                        .fill(AppColors.border.opacity(0.6))
                        .frame(height: 1)
                        .gridCellColumns(compounds.count + 1)
                }
            }
            .padding(AppSpacing.xl)
            .background(AppColors.cardBackground)
            .overlay(
                RoundedRectangle(cornerRadius: 20, style: .continuous)
                    .stroke(AppColors.border, lineWidth: 1)
            )
            .clipShape(RoundedRectangle(cornerRadius: 20, style: .continuous))
        }
    }
}
