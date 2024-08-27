import React from 'react';

interface CircleProps {
    progress: any;
    color: string;
    charCount: number;
}

export const ProgressCircle: React.FC<CircleProps> = ({
    progress,
    color,
    charCount,
}) => {
    return (
        <div className="char-indicator">
            <svg>
                <circle
                    cx="15"
                    cy="15"
                    r="14"
                    style={{
                        strokeDasharray: '88',
                        strokeDashoffset: `${88 - (88 * progress) / 100}`,
                        stroke: color,
                    }}
                />
                {charCount === 0 ? (
                    <text
                        x="15"
                        y="17"
                        textAnchor="middle"
                        dominantBaseline="central"
                        fontSize="16px"
                        fill={color}
                        transform="rotate(90, 15, 15)"
                    >
                        ✓
                    </text>
                ) : (
                    <text
                        x="15"
                        y="15"
                        textAnchor="middle"
                        dominantBaseline="central"
                        fontSize="10px"
                        fill={color}
                        transform="rotate(90, 15, 15)"
                    >
                        {charCount}
                    </text>
                )}
            </svg>
        </div>
    );
};
