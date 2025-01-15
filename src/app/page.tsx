"use client";
import React, { useState } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { Download } from 'lucide-react';
import { allTransactions } from "@/const/constants";

export default function Home() {
  const TRANSACTIONS_PER_PAGE = 30;
  const totalPages = Math.ceil(
    (allTransactions.length - (TRANSACTIONS_PER_PAGE - 20)) / TRANSACTIONS_PER_PAGE
  ) + 1; // Account for the smaller first page
  
  const seperatedTransactions = Array.from({ length: totalPages }, (_, index) => {
    if (index === 0) {
      // First page: fewer transactions
      return allTransactions.slice(0, TRANSACTIONS_PER_PAGE - 20);
    } else {
      // Subsequent pages: calculate based on adjusted start and end
      const start = (TRANSACTIONS_PER_PAGE - 20) + (index - 1) * TRANSACTIONS_PER_PAGE;
      const end = start + TRANSACTIONS_PER_PAGE;
      return allTransactions.slice(start, end);
    }
  });

  const StatementHeader = ({ pageNum }: { pageNum: number }) => (
    <div>
      {/* Header with Scotia Logo */}
      <div className="flex justify-between items-start mb-6">
        <img
          src="https://images.unsplash.com/photo-1616469832301-ffaeadc68cf3?auto=format&fit=crop&w=120&h=40&q=80"
          alt="Scotia Logo"
          className="mb-4 h-10 object-contain"
        />
        <div className="text-right">
          <p className="text-[8pt] text-gray-500">
            Page {pageNum} of {totalPages}
          </p>
          <p className="text-[8pt]">*55D000000*</p>
          <p className="text-[8pt]">SBSAV16000_6079632_008</p>
        </div>
      </div>

      {pageNum === 1 && (
        <>
          {/* Customer Information Section - Only on first page */}
          <div className="grid grid-cols-2 mb-8">
            <div>
              <p className="font-bold">MR GHULAM HAIDER</p>
              <p>6 COLVILLE ST</p>
              <p>ST. JOHN'S NL</p>
              <p>A1E 3J8</p>
            </div>
            <div className="text-right">
              <p>82263</p>
              <p>350 TORBAY ROAD</p>
              <p>ST. JOHN'S NEWFOUNDLAND A1A 4E1</p>
            </div>
          </div>

          {/* Account Information - Only on first page */}
          <div className="mb-4">
            <p>Your account number:</p>
            <p className="font-bold">82263 06988 81</p>
            <p>Questions?</p>
            <p>Call 1 800 4-SCOTIA</p>
            <p>(1 800 472-6842)</p>
            <p>For online account access:</p>
            <p>www.scotiabank.com</p>
          </div>

          {/* Account Summary - Only on first page */}
          <div className="mb-8">
            <h2 className="font-bold mb-4">
              Your Student Banking Advantage Plan account summary
            </h2>
            <div className="grid grid-cols-[3fr_1fr] gap-1">
              <p>Opening Balance on June 24, 2022</p>
              <p className="text-right">$3,451.71</p>
              <p>Minus total withdrawals</p>
              <p className="text-right">$7,055.31</p>
              <p>Plus total deposits</p>
              <p className="text-right">$4,610.85</p>
              <p>Closing Balance on July 23, 2022</p>
              <p className="text-right">$1,007.25</p>
            </div>
          </div>
        </>
      )}

      {/* Table Header - On all pages */}
      <h3 className="font-bold mb-4">
        {pageNum === 1
          ? "Here's what happened in your account this statement period"
          : "Here's what happened in your account (continued)"}
      </h3>
    </div>
  );

  const StatementFooter = ({ pageNum }: { pageNum: number }) => (
    <div className="mt-8 flex justify-between items-center text-[8pt]">
      <p>SBSAV16000_6079632_008</p>
      <div className="text-right">
        <p>0425736</p>
        <p>019{748 + pageNum}</p>
      </div>
    </div>
  );

  const StatementPage = ({
    pageNum,
    transactions,
  }: {
    pageNum: number;
    transactions: typeof allTransactions;
  }) => (
    <div
      id={`scotia-statement-page-${pageNum}`}
      className="w-[8.5in] min-h-[11in] bg-white p-8 font-mono text-[10pt] leading-tight mb-8"
    >
      <StatementHeader pageNum={pageNum} />

      <table className="w-full border-collapse text-[9pt]">
        <thead>
          <tr className="border-b border-gray-300">
            <th className="py-2 text-left w-24">Date</th>
            <th className="py-2 text-left">Transactions</th>
            <th className="py-2 text-right w-32">
              Amounts
              <br />
              withdrawn ($)
            </th>
            <th className="py-2 text-right w-32">
              Amounts
              <br />
              deposited ($)
            </th>
            <th className="py-2 text-right w-32">Balance ($)</th>
          </tr>
        </thead>
        <tbody>
          {seperatedTransactions[pageNum - 1].map((t, i) => (
            <tr key={i} className="border-b border-gray-200">
              <td className="py-1">{t.date}</td>
              <td className="py-1 whitespace-pre-line">{t.description}</td>
              <td className="py-1 text-right">{t.withdrawn?.toFixed(2)}</td>
              <td className="py-1 text-right">{t.deposited?.toFixed(2)}</td>
              <td className="py-1 text-right">{t.balance?.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <StatementFooter pageNum={pageNum} />
    </div>
  );

  const handleDownload = async () => {
    try {
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "in",
        format: "letter",
      });

      for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
        const element = document.getElementById(
          `scotia-statement-page-${pageNum}`
        );
        if (!element) continue;

        const canvas = await html2canvas(element, {
          scale: 2, // Increase quality
          logging: false,
          useCORS: true,
          allowTaint: true,
        });

        const imgData = canvas.toDataURL("image/png");

        if (pageNum > 1) {
          pdf.addPage();
        }

        pdf.addImage(imgData, "PNG", 0, 0, 8.5, 11);
      }

      pdf.save("scotia-statement.pdf");
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };

  return (
    <div className="relative">
      {/* Download Button */}
      <button
        onClick={handleDownload}
        className="fixed top-4 right-4 flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg shadow-lg transition-colors duration-200"
      >
        <Download size={20} />
        <span>Download PDF</span>
      </button>

      {/* Render all pages */}
      {Array.from({ length: totalPages }, (_, i) => {
        const pageNum = i + 1;
        const startIdx = i * TRANSACTIONS_PER_PAGE;
        const pageTransactions = allTransactions.slice(
          startIdx,
          startIdx + TRANSACTIONS_PER_PAGE
        );

        return (
          <StatementPage
            key={pageNum}
            pageNum={pageNum}
            transactions={pageTransactions}
          />
        );
      })}
    </div>
  );
}
