// MyLettersPage.tsx
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Eye, Loader2, Search } from "lucide-react";
import api from "@/api/axiosClient";
import Button from "@/components/ui/button/Button";
import { Card, CardContent } from "@/components/ui/card/Card";
import Input from "@/components/form/input/InputField";
import { useNavigate } from "react-router-dom";

interface LetterRequest {
  id: string;
  title: string;
  approvalType: {
    name: string;
  };
  createdAt: string;
  currentStatus: string;
}

export default function MyLettersPage() {
  const navigate = useNavigate();
  const [letters, setLetters] = useState<LetterRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filteredDate, setFilteredDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchLetters = async () => {
      try {
        const res = await api.get("/approvalrequests");
        const completed = res.data.filter(
          (r: LetterRequest) => r.currentStatus === "Completed"
        );
        setLetters(completed);
      } catch (err: any) {
        setError("Failed to fetch letters");
      } finally {
        setLoading(false);
      }
    };
    fetchLetters();
  }, []);

  const filteredLetters = letters.filter((l) => {
    const matchSearch = l.title.toLowerCase().includes(search.toLowerCase());
    const matchDate = filteredDate
      ? format(new Date(l.createdAt), "yyyy-MM-dd") === filteredDate
      : true;
    return matchSearch && matchDate;
  });

  const totalPages = Math.ceil(filteredLetters.length / itemsPerPage) || 1;
  const pagedLetters = filteredLetters.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filteredDate]);

  return (
    <div className="min-h-screen p-4 sm:p-8 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white border-l-4 border-primary pl-4 mb-6">
        My Letters
      </h1>
      
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search by title..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Input
          type="date"
          value={filteredDate}
          onChange={(e) => setFilteredDate(e.target.value)}
          className="sm:w-auto"
        />
      </div>

      <Card className="border border-gray-200 dark:border-gray-700 dark:bg-gray-800 shadow-md dark:shadow-none transition-all duration-300">
        <CardContent className="p-4 sm:p-6 overflow-x-auto">
          {loading ? (
            <div className="py-10 flex justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="text-center text-red-600 font-semibold py-6">
              {error}
            </div>
          ) : pagedLetters.length === 0 ? (
            <div className="text-center text-gray-500 py-6">
              No letters found.
            </div>
          ) : (
            <>
              <table className="min-w-full text-sm text-gray-800 dark:text-gray-100">
                <thead className="bg-gray-100 dark:bg-gray-700 text-xs uppercase">
                  <tr>
                    <th className="px-4 py-3 text-left">No</th>
                    <th className="px-4 py-3 text-left">Title</th>
                    <th className="px-4 py-3 text-left">Type</th>
                    <th className="px-4 py-3 text-left">Date</th>
                    <th className="px-4 py-3 text-left">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {pagedLetters.map((item, i) => (
                    <tr
                      key={item.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-900"
                    >
                      <td className="px-4 py-3">
                        {(currentPage - 1) * itemsPerPage + i + 1}
                      </td>
                      <td className="px-4 py-3">{item.title}</td>
                      <td className="px-4 py-3">{item.approvalType?.name}</td>
                      <td className="px-4 py-3">
                        {format(new Date(item.createdAt), "dd MMM yyyy")}
                      </td>
                      <td className="px-4 py-3">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex items-center gap-1 text-green-600 dark:text-green-400 hover:bg-green-600 hover:text-white"
                          onClick={() =>
                            navigate(`/letters/metadata/${item.id}`)
                          }
                        >
                          <Eye className="w-4 h-4" /> View Letter
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  const maxButtons = 5;

  const getPageNumbers = () => {
    let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    let endPage = startPage + maxButtons - 1;
    if (endPage > totalPages) {
      endPage = totalPages;
      startPage = Math.max(1, endPage - maxButtons + 1);
    }
    const pages = [];
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <nav
      className="flex justify-center items-center space-x-2 mt-4 select-none"
      aria-label="Pagination Navigation"
    >
      <button
        onClick={() => onPageChange(1)}
        disabled={currentPage === 1}
        className="px-3 py-1 rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50"
      >
        {"<<"}
      </button>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-1 rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50"
      >
        {"<"}
      </button>

      {pageNumbers.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`px-3 py-1 rounded-md border border-gray-300 dark:border-gray-600 hover:bg-primary hover:text-white focus:outline-none focus:ring-2 focus:ring-primary ${
            page === currentPage
              ? "bg-primary text-blue-600"
              : "bg-white dark:bg-gray-800 dark:text-white"
          }`}
        >
          {page}
        </button>
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-1 rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50"
      >
        {">"}
      </button>
      <button
        onClick={() => onPageChange(totalPages)}
        disabled={currentPage === totalPages}
        className="px-3 py-1 rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50"
      >
        {">>"}
      </button>
    </nav>
  );
}
