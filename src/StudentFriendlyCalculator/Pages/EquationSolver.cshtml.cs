using System.Text.RegularExpressions;
using NCalc;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace StudentFriendlyCalculator.Pages
{
    [IgnoreAntiforgeryToken]
    public class EquationSolverModel : PageModel
    {
        // Bind the input field “Equation”
        [BindProperty]
        public string Equation { get; set; } = string.Empty;

        // Result shown on the page
        public string? Solution { get; private set; }

        /// <summary>
        /// Replace UI-level symbols (√, x², ×, ÷, cos⁻¹ …) with NCalc-friendly syntax,
        /// and add implicit multiplication (*).
        /// </summary>
        private static string Preprocess(string raw)
        {
            // Symbol replacements
            raw = raw
                .Replace("×", "*")
                .Replace("÷", "/")
                .Replace("−", "-")
                .Replace("√", "sqrt")
                .Replace("x²", "Pow(x,2)")
                .Replace("cos⁻¹", "Acos")
                .Replace("sin⁻¹", "Asin")
                .Replace("tan⁻¹", "Atan")
                .Replace("Δ", "delta");

            // Add * before an x or Pow( when preceded by a number: 7x  → 7*x
            raw = Regex.Replace(raw, @"(?<=\d)(?=x)", "*");
            raw = Regex.Replace(raw, @"(?<=\d)(?=Pow\()", "*");

            // Wrap sqrt arguments without parentheses: sqrt9 → sqrt(9)
            raw = Regex.Replace(raw, @"sqrt(\d+(\.\d+)?)", m => $"sqrt({m.Groups[1].Value})");

            return raw;
        }

        public void OnGet() { }

        // POST handler triggered by “=” button
        public void OnPostSolve()
        {
            if (string.IsNullOrWhiteSpace(Equation))
            {
                Solution = "";
                return;
            }

            string exprText = Preprocess(Equation);

            // Linear equation ax + b = c  (must contain '=' and 'x')
            if (exprText.Contains('=') && exprText.Contains('x'))
            {
                var parts = exprText.Split('=', StringSplitOptions.RemoveEmptyEntries);
                if (parts.Length != 2)
                {
                    Solution = "Invalid equation format.";
                    return;
                }

                try
                {
                    // Evaluate left side at x = 0  → b
                    var left0 = new Expression(parts[0]);
                    left0.EvaluateParameter += (name, args) => { if (name == "x") args.Result = 0; };
                    double b = Convert.ToDouble(left0.Evaluate());

                    // Evaluate left side at x = 1  → a + b
                    var left1 = new Expression(parts[0]);
                    left1.EvaluateParameter += (name, args) => { if (name == "x") args.Result = 1; };
                    double aPlusB = Convert.ToDouble(left1.Evaluate());
                    double a = aPlusB - b;

                    double c = Convert.ToDouble(new Expression(parts[1]).Evaluate());

                    if (Math.Abs(a) < 1e-8)
                        Solution = "No solution (a = 0).";
                    else
                        Solution = $"x = {(c - b) / a}";
                }
                catch (Exception ex)
                {
                    Solution = "Error: " + ex.Message;
                }
                return;
            }

            // Contains x but no “=” → prompt user
            if (exprText.Contains('x'))
            {
                Solution = "Enter the equation in the form ax+b=c";
                return;
            }

            // Plain expression evaluation
            try
            {
                var expr = new Expression(exprText);
                expr.EvaluateFunction += (name, args) =>
                {
                    if (name == "delta" && args.Parameters.Length == 3)
                    {
                        double a = Convert.ToDouble(args.Parameters[0].Evaluate());
                        double b = Convert.ToDouble(args.Parameters[1].Evaluate());
                        double c = Convert.ToDouble(args.Parameters[2].Evaluate());
                        args.Result = b * b - 4 * a * c;   // discriminant
                    }
                };
                var result = expr.Evaluate();
                Solution = result?.ToString() ?? "";
            }
            catch
            {
                Solution = "Invalid expression.";
            }
        }
    }
}