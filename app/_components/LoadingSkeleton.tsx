"use client";

import React from "react";

export const LoadingSkeleton: React.FC = () => {
    return (
        <div className="p-4 space-y-4">
            <div className="h-6 bg-gray-300 rounded-md animate-pulse"></div>
            <div className="space-y-2">
                <div className="h-12 bg-gray-300 rounded-md animate-pulse"></div>
                <div className="h-12 bg-gray-300 rounded-md animate-pulse"></div>
                <div className="h-12 bg-gray-300 rounded-md animate-pulse"></div>
            </div>
        </div>
    );
};
