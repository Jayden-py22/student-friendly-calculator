using System.Text.RegularExpressions;
using NCalc;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace StudentFriendlyCalculator.Pages
{
    [IgnoreAntiforgeryToken]
    public class EquationSolverModel : PageModel
    {
        /// <summary>
        /// The raw text that the user enters in the calculator display.
        /// Bound to the <input> by ASP.NET Core’s model‑binding.
        /// </summary>
        [BindProperty]
        public string Equation { get; set; } = string.Empty;

        /// <summary>
        /// Human‑readable answer rendered back to the page
        /// (linear/quadratic solution, evaluated number, or error message).
        /// </summary>
        public string? Solution { get; private set; }

        /// <summary>
        /// Replace UI-level symbols (√, x², ×, ÷, cos⁻¹ …) with NCalc-friendly syntax,
        /// and add implicit multiplication (*).
        /// </summary>
        private static string Preprocess(string raw)
        {
            // ---------------------------------------------------------
            // 1) Symbol normalisation
            //    Convert UI‑friendly symbols into NCalc‑compatible tokens.
            // ---------------------------------------------------------
            raw = raw
                .Replace("×", "*")
                .Replace("÷", "/")
                .Replace("−", "-")
                .Replace("√", "Sqrt")
                .Replace("x²", "Pow(x,2)")
                .Replace("π", "PI")
                .Replace("sin", "Sin")
                .Replace("cos", "Cos")
                .Replace("tan", "Tan");

            // ---------------------------------------------------------
            // 2) Implicit multiplication
            //    e.g.  7x  →  7 * x
            // ---------------------------------------------------------
            raw = Regex.Replace(raw, @"(?<=\d)(?=x)", "*");
            raw = Regex.Replace(raw, @"(?<=\d)(?=Pow\()", "*");

            // ---------------------------------------------------------
            // 3) Ensure functions have parentheses
            // ---------------------------------------------------------
            raw = Regex.Replace(raw, @"sqrt(\d+(\.\d+)?)", m => $"sqrt({m.Groups[1].Value})");

            // ---------------------------------------------------------
            // 4) Caret exponentiation  (a^b → Pow(a,b))
            // ---------------------------------------------------------
            raw = Regex.Replace(raw, @"\bpi\b", "PI", RegexOptions.IgnoreCase);
            raw = Regex.Replace(raw, @"\bsin\b", "Sin", RegexOptions.IgnoreCase);
            raw = Regex.Replace(raw, @"\bcos\b", "Cos", RegexOptions.IgnoreCase);
            raw = Regex.Replace(raw, @"\btan\b", "Tan", RegexOptions.IgnoreCase);
            raw = Regex.Replace(
                raw,
                @"([\d\.]+|\bPI\b|\([^()]+\))\^(\d+)",
                m => $"Pow({m.Groups[1].Value},{m.Groups[2].Value})");

            // Support variable bases such as x^2 or y^3
            raw = Regex.Replace(
                raw,
                @"\b([A-Za-z]+)\^(\d+)",
                m => $"Pow({m.Groups[1].Value},{m.Groups[2].Value})");

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

            // =========================================================
            // QUADRATIC SOLVER
            // =========================================================
            if (exprText.Contains("Pow(x,2") && exprText.Contains('=') && exprText.Contains('x'))
            {
                var parts = exprText.Split('=', StringSplitOptions.RemoveEmptyEntries);
                if (parts.Length != 2)
                {
                    Solution = "Invalid equation format.";
                    return;
                }

                string diff = $"({parts[0]})-({parts[1]})";

                try
                {
                    // Build f(x) = left - right  so that solving f(x) = 0

                    // Evaluate the difference expression at a given x
                    double EvalAt(double val)
                    {
                        var e = new Expression(diff);
                        e.EvaluateParameter += (name, args) => { if (name == "x") args.Result = val; };
                        return Convert.ToDouble(e.Evaluate());
                    }

                    double f0   = EvalAt(0);   // c
                    double f1   = EvalAt(1);   // a + b + c
                    double fNeg = EvalAt(-1);  // a - b + c

                    double c = f0;
                    double a = (f1 + fNeg) / 2 - c;
                    double b = (f1 - fNeg) / 2;

                    if (Math.Abs(a) < 1e-8)
                    {
                        // Degenerated to linear; fall through to linear solver
                    }
                    else
                    {
                        // Calculate discriminant (b² - 4ac) to decide root nature
                        double disc = b * b - 4 * a * c;
                        if (disc < 0)
                        {
                            Solution = "No real solution.";
                        }
                        else if (Math.Abs(disc) < 1e-8)
                        {
                            double xRoot = -b / (2 * a);
                            Solution = $"x = {xRoot}";
                        }
                        else
                        {
                            double sqrtD = Math.Sqrt(disc);
                            double x1 = (-b + sqrtD) / (2 * a);
                            double x2 = (-b - sqrtD) / (2 * a);
                            Solution = $"x = {x1} or x = {x2}";
                        }
                        return;
                    }
                }
                catch (Exception ex)
                {
                    Solution = "Error: " + ex.Message;
                    return;
                }
            }

            // =========================================================
            // LINEAR SOLVER (ax + b = c)
            // =========================================================
            if (exprText.Contains('=') && exprText.Contains('x') && !exprText.Contains("Pow("))
            {
                var parts = exprText.Split('=', StringSplitOptions.RemoveEmptyEntries);
                if (parts.Length != 2)
                {
                    Solution = "Invalid equation format.";
                    return;
                }

                string diff = $"({parts[0]})-({parts[1]})";

                try
                {
                    var f0 = new Expression(diff);
                    f0.EvaluateParameter += (name, args) => { if (name == "x") args.Result = 0; };
                    double b = Convert.ToDouble(f0.Evaluate());

                    var f1 = new Expression(diff);
                    f1.EvaluateParameter += (name, args) => { if (name == "x") args.Result = 1; };
                    double aPlusB = Convert.ToDouble(f1.Evaluate());
                    double a = aPlusB - b;

                    if (Math.Abs(a) < 1e-8)
                        Solution = "No unique solution (a = 0)";
                    else
                        Solution = $"x = {-b / a}";
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

            // =========================================================
            // Pure arithmetic expression (no variable)
            // =========================================================
            try
            {
                var expr = new Expression(exprText);
                expr.EvaluateParameter += (name, args) =>
                {
                    if (string.Equals(name, "PI", StringComparison.OrdinalIgnoreCase))
                        args.Result = Math.PI;
                };
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