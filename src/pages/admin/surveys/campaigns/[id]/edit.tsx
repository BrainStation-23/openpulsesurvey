
import React from "react";
import { useParams } from "react-router-dom";

export default function EditSurveyCampaign() {
  const { id } = useParams<{ id: string }>();
  
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-4">Edit Survey Campaign</h1>
      <p>Campaign ID: {id}</p>
      <p>Campaign editing will be implemented in a future update.</p>
    </div>
  );
}
