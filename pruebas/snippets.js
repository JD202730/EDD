/* Fragmentos de Python para validar el intérprete contra CPython real (ver pruebas.html) */
window.SNIPPETS = [
String.raw`print(1+2*3, 7//2, -7//2, 7%3, -7%3, 2**10, 2**-1, 7/2, 4/2, 10/5, 3*1.5, 0.1+0.2)`,
String.raw`print("a"+"b", "ab"*3, "Hello".upper(), "a,b,c".split(","), "-".join(["x","y"]), "abc"[1], "abc"[-1], "abcdef"[1:4], "abcdef"[::-1], len("héllo"))`,
String.raw`l=[3,1,2]
l.append(4)
l.sort()
print(l, l[::-1], l[1:3], sum(l), max(l), min(l), len(l))
l.insert(0, 9)
print(l.pop(), l.pop(0), l)`,
String.raw`d={"a":1}
d["b"]=2
print(d, d.get("c", 0), list(d.items()), "a" in d, len(d))
for k,v in d.items():
    print(k,v)`,
String.raw`def factorial(n):
    if n <= 1:
        return 1
    return n * factorial(n - 1)
def fib(n):
    if n < 2: return n
    return fib(n-1) + fib(n-2)
def potencia(x, n):
    if n == 0:
        return 1
    if n % 2 == 0:
        m = potencia(x, n // 2)
        return m * m
    return x * potencia(x, (n - 1) // 2) * potencia(x, (n - 1) // 2)
print(factorial(5), factorial(10), fib(15), potencia(2, 10), potencia(3, 7))`,
String.raw`class NodoArbol:
    def __init__(self, valor):
        self.valor = valor
        self.izq = None
        self.der = None
def insertar(nodo, v):
    if nodo is None:
        return NodoArbol(v)
    if v < nodo.valor:
        nodo.izq = insertar(nodo.izq, v)
    elif v > nodo.valor:
        nodo.der = insertar(nodo.der, v)
    return nodo
def inorden(nodo, salida):
    if nodo is None: return
    inorden(nodo.izq, salida)
    salida.append(nodo.valor)
    inorden(nodo.der, salida)
def pre(nodo, s):
    if nodo is None: return
    s.append(nodo.valor); pre(nodo.izq, s); pre(nodo.der, s)
raiz = None
for v in [8, 3, 10, 1, 6, 14, 3]:
    raiz = insertar(raiz, v)
a = []; inorden(raiz, a); b = []; pre(raiz, b)
print(a, b)`,
String.raw`print([x*x for x in range(5) if x%2==0], {x: x+1 for x in range(3)}, sorted({x%3 for x in range(10)}), sum(x for x in range(5)))
print([(i, j) for i in range(2) for j in range(3) if i != j])`,
String.raw`print(f"{3.14159:.2f} {42:5d}|{'x':>3}|{7:03d}|{1234567:,}|{255:x}|{0.256:.1%}|{'ab':^6}|")
x = 5
print(f"x={x}, doble={x*2}, {x!r}")`,
String.raw`try:
    1/0
except ZeroDivisionError as e:
    print("zd", e)
try:
    [][1]
except IndexError as e:
    print(e)
try:
    {}["k"]
except KeyError as e:
    print("KeyError", e)
try:
    None.x
except AttributeError as e:
    print(e)
try:
    int("x")
except ValueError as e:
    print(e)
try:
    print(zzz)
except NameError as e:
    print(e)
try:
    "a" + 1
except TypeError as e:
    print(e)
try:
    [1,2][5]
except Exception as e:
    print(type(e).__name__)`,
String.raw`def f(n):
    return f(n + 1)
try:
    f(0)
except RecursionError:
    print("RE")`,
String.raw`from functools import lru_cache
@lru_cache(maxsize=None)
def fib(n):
    return n if n < 2 else fib(n-1) + fib(n-2)
print(fib(50), fib(70))`,
String.raw`def f(n, cache={}):
    if n in cache: return cache[n]
    cache[n] = n * 2
    return cache[n]
print(f(1), f(2), f(1))
def g(x, acc=[]):
    acc.append(x)
    return acc
print(g(1), g(2))`,
String.raw`cont = 0
def inc():
    global cont
    cont += 1
inc(); inc()
print(cont)
def externa():
    x = 0
    def interna():
        nonlocal x
        x += 1
        return x
    interna(); return interna()
print(externa())`,
String.raw`pares = [(3, 'c'), (1, 'a'), (2, 'b'), (1, 'z')]
print(sorted(pares), sorted(pares, reverse=True), sorted(["bb","a","ccc"], key=len), sorted([3,1,2], key=lambda x: -x))
print(list(enumerate("ab")), list(zip([1,2,3],"ab")), list(map(lambda x: x+1, [1,2])), list(filter(None, [0,1,2])))`,
String.raw`a, b = 1, 2
a, b = b, a
first, *rest = [1,2,3,4]
*init, last = (1,2,3)
print(a, b, first, rest, init, last)
t = (1,)
print(t, (1,2), ())`,
String.raw`i = 0
while i < 10:
    i += 1
    if i % 2: continue
    if i > 6: break
    print(i)
else:
    print("fin")
for x in range(3):
    pass
else:
    print("for-else", x)`,
String.raw`from collections import deque, defaultdict
q = deque([1])
q.append(2); q.appendleft(0)
print(q, q.popleft(), len(q), list(q))
d = defaultdict(list)
d["a"].append(1); d["a"].append(2)
print(dict(d), d["zz"])
c = defaultdict(int)
for ch in "hello": c[ch] += 1
print(dict(c))`,
String.raw`class A:
    def __init__(self, x):
        self.x = x
    def __repr__(self):
        return "A(" + str(self.x) + ")"
    def __eq__(self, o):
        return self.x == o.x
    def doble(self):
        return A(self.x * 2)
class B(A):
    def __init__(self, x, y):
        super().__init__(x)
        self.y = y
    def suma(self):
        return self.x + self.y
a = A(2)
print(a, a == A(2), a.doble(), [a, A(3)], a != A(3))
b = B(1, 2)
print(b.suma(), b.doble(), isinstance(b, A), isinstance(a, B))`,
String.raw`print(1e16, 1e-5, 123456789.123, 5/1, round(2.5), round(3.5), round(2.675, 2), int(3.9), int(-3.9), float("inf"), -float("inf"), 1.5e300*1e10)
print(7.0, 7.5, -0.0, 1/3, 2/3, 100.0/3, 3.0*2, 10**15, 2.0**3, float(3), 1e15+0.5)`,
String.raw`print(0 or "x", 1 and 2, not 0, 1<2<3, 3>2>2, None is None, [] == [], [1] == [1.0], (1,2) < (1,3), "a" < "b", [1,2] < [1,3], 1 == True, 2 in [1,2], "b" in "abc", 3 not in [1])`,
String.raw`print(divmod(7, 2), divmod(-7, 2), abs(-3), abs(-2.5), pow(2, 3, 5), pow(2, 10), min(3, 1, 2), max([1, 5, 2]), max("b", "a"), sum([1.5, 1.5]), sum([[1],[2]], []))`,
String.raw`print("{} {}".format(1, 2), "%d-%s" % (3, "a"), str(3.0), repr("it's"), repr('a"b'), repr("a"), None, True, str(None), [None, True, 'x', 1.0])
print("a", "b", sep="-", end="!\n")
print()
print("x")`,
String.raw`def f(a, b=2, *args, **kw):
    print(a, b, args, kw)
f(1)
f(1, 3, 4, 5, x=6)
f(b=9, a=8)
print(*[1, 2, 3])
def g(x, y): return x - y
print(g(*[5, 3]), g(**{'y': 1, 'x': 10}))`,
String.raw`class AVL:
    def __init__(self, v):
        self.v = v; self.izq = None; self.der = None; self.h = 0
def alt(n): return -1 if n is None else n.h
def fac(n): return 0 if n is None else alt(n.izq) - alt(n.der)
def act(n): n.h = 1 + max(alt(n.izq), alt(n.der))
def rot_der(y):
    x = y.izq
    y.izq = x.der
    x.der = y
    act(y); act(x)
    return x
def rot_izq(x):
    y = x.der
    x.der = y.izq
    y.izq = x
    act(x); act(y)
    return y
def insertar(n, v):
    if n is None: return AVL(v)
    if v < n.v: n.izq = insertar(n.izq, v)
    elif v > n.v: n.der = insertar(n.der, v)
    else: return n
    act(n)
    f = fac(n)
    if f > 1 and v < n.izq.v: return rot_der(n)
    if f < -1 and v > n.der.v: return rot_izq(n)
    if f > 1 and v > n.izq.v:
        n.izq = rot_izq(n.izq); return rot_der(n)
    if f < -1 and v < n.der.v:
        n.der = rot_der(n.der); return rot_izq(n)
    return n
def nota(n):
    if n is None: return ""
    if n.izq is None and n.der is None: return str(n.v)
    return str(n.v) + "(" + nota(n.izq) + "," + nota(n.der) + ")"
r = None
for v in [10, 20, 30, 40, 50, 25]:
    r = insertar(r, v)
    print(v, nota(r), r.h)
r = None
for v in [30, 10, 20, 5, 4, 3, 40, 45, 42]:
    r = insertar(r, v)
print(nota(r), fac(r))`,
String.raw`def min_monedas(monedas, V):
    INF = float('inf')
    dp = [0] + [INF] * V
    for v in range(1, V + 1):
        for c in monedas:
            if c <= v and dp[v - c] + 1 < dp[v]:
                dp[v] = dp[v - c] + 1
    return dp[V] if dp[V] != INF else -1
print(min_monedas([1, 3, 4], 6), min_monedas([2], 3), min_monedas([1,5,10,25], 63))
def greedy(monedas, V):
    n = 0
    for c in sorted(monedas, reverse=True):
        n += V // c
        V %= c
    return n
print(greedy([1,3,4], 6))`,
String.raw`class N:
    def __init__(s, v): s.v = v; s.izq = None; s.der = None
def ins(n, v):
    if n is None: return N(v)
    if v < n.v: n.izq = ins(n.izq, v)
    elif v > n.v: n.der = ins(n.der, v)
    return n
def elim(n, v):
    if n is None: return None
    if v < n.v: n.izq = elim(n.izq, v)
    elif v > n.v: n.der = elim(n.der, v)
    else:
        if n.izq is None: return n.der
        if n.der is None: return n.izq
        p = n.izq
        while p.der is not None: p = p.der
        n.v = p.v
        n.izq = elim(n.izq, p.v)
    return n
def nota(n):
    if n is None: return ""
    if n.izq is None and n.der is None: return str(n.v)
    return str(n.v) + "(" + nota(n.izq) + "," + nota(n.der) + ")"
r = None
for v in [50, 30, 70, 20, 40, 60, 80]: r = ins(r, v)
print(nota(r))
r = elim(r, 30); print(nota(r))
r = elim(r, 50); print(nota(r))
r = elim(r, 20); print(nota(r))`,
String.raw`def merge_sort(v):
    if len(v) <= 1: return v
    m = len(v) // 2
    a, b = merge_sort(v[:m]), merge_sort(v[m:])
    out = []
    i = j = 0
    while i < len(a) and j < len(b):
        if a[i] <= b[j]:
            out.append(a[i]); i += 1
        else:
            out.append(b[j]); j += 1
    return out + a[i:] + b[j:]
def quick(v):
    if len(v) <= 1: return v
    p = v[0]
    return quick([x for x in v[1:] if x < p]) + [p] + quick([x for x in v[1:] if x >= p])
print(merge_sort([5,2,9,1,5,6]), quick([3,1,4,1,5,9,2,6]))`,
String.raw`a = {1, 2, 3}; b = {2, 3, 4}
print(sorted(a & b), sorted(a | b), sorted(a - b), sorted(a ^ b), 2 in a, len(a), sorted(a.union(b)))
s = set()
s.add(1); s.add(1); s.add(2)
print(len(s), set([1,1,1]), set())`,
String.raw`class Err(Exception):
    pass
def f(x):
    try:
        if x == 0: raise Err("cero")
        if x == 1: raise ValueError("uno")
        return "ok"
    except Err as e:
        return "Err:" + str(e)
    except (ValueError, TypeError) as e:
        return "VT:" + str(e)
    finally:
        print("fin", x)
print(f(0), f(1), f(2))
try:
    try:
        raise KeyError("k")
    finally:
        print("limpieza")
except KeyError as e:
    print("atrapado", e)
try:
    assert 1 == 2, "falla"
except AssertionError as e:
    print("assert", e)
else:
    print("no")`,
String.raw`s = "  Hola Mundo  "
print(s.strip(), s.lstrip(), s.rstrip(), s.replace("o", "0"), s.find("Mundo"), s.count("o"), s.strip().startswith("Hola"), s.strip().endswith("x"), "ab cd".title(), "7".zfill(3), "abc".center(7, "*"), "a-b".partition if False else 1)
print("x".join("abc"), "A1".isalnum(), "12".isdigit(), "a b  c".split(), "a,b,,c".split(","), "abc".ljust(5) + "|", "abc".rjust(5, "."))`,
String.raw`l = [1, 2, 3, 4, 5]
l[1:3] = [9]
print(l)
del l[0]
print(l)
l2 = list(range(10))
print(l2[::2], l2[-3:], l2[:-7], l2[8:2:-2])
t = (1, 2, 3)
print(t[1:], t[-1], t + (4,), t * 2, t.index(2), t.count(1))`,
String.raw`a = [1]
b = a
b.append(2)
print(a, a is b, a == [1, 2])
c = a.copy(); c.append(3)
print(a, c)
x = [0] * 3
x[0] = 1
print(x)
m = [[0] * 2 for _ in range(2)]
m[0][0] = 5
print(m)
n = [[0] * 2] * 2
n[0][0] = 5
print(n)
a += [7]
print(a, b)
s = "ab"
s += "c"
print(s)`,
String.raw`def contar(n):
    c = 0
    for i in range(n):
        for j in range(i):
            c += 1
    return c
def log_pasos(n):
    k = 0
    while n > 1:
        n //= 2
        k += 1
    return k
def dup(n):
    j = 1; k = 0
    while j < n:
        j *= 2; k += 1
    return k
print(contar(10), contar(100), log_pasos(1024), log_pasos(1000), dup(1000), dup(1024), dup(1025))
print(sum(range(100000)), len([x for x in range(50000)]))`,
String.raw`lam = lambda x, y=2: x * y
print(lam(3), lam(3, 4), (lambda: 7)(), list(map(lambda p: p[1], [(1, 'a'), (2, 'b')])))
def compose(f, g): return lambda x: f(g(x))
print(compose(lambda x: x + 1, lambda x: x * 2)(5))
fs = [lambda i=i: i for i in range(3)]
print([f() for f in fs])`,
String.raw`def cuenta_regresiva(n):
    if n == 0:
        print("listo")
        return
    print(n)
    cuenta_regresiva(n - 1)
cuenta_regresiva(3)
def suma_lista(v):
    if not v: return 0
    return v[0] + suma_lista(v[1:])
def reverso(s):
    if s == "": return ""
    return reverso(s[1:]) + s[0]
def es_palindromo(s):
    if len(s) < 2: return True
    return s[0] == s[-1] and es_palindromo(s[1:-1])
def max_rec(v):
    if len(v) == 1: return v[0]
    m = max_rec(v[1:])
    return v[0] if v[0] > m else m
print(suma_lista([1,2,3,4]), reverso("abc"), es_palindromo("reconocer"), es_palindromo("abca"), max_rec([3,9,2]))`,
String.raw`def hanoi(n, a, b, c, movs):
    if n == 0: return
    hanoi(n-1, a, c, b, movs)
    movs.append((a, c))
    hanoi(n-1, b, a, c, movs)
m = []
hanoi(3, 'A', 'B', 'C', m)
print(len(m), m[:3])
def escalera(n, memo=None):
    if memo is None: memo = {}
    if n <= 1: return 1
    if n in memo: return memo[n]
    memo[n] = escalera(n-1, memo) + escalera(n-2, memo)
    return memo[n]
print(escalera(10), escalera(30))`,
String.raw`def n_reinas(n):
    sol = []
    def seguro(cols, c):
        r = len(cols)
        for i, cc in enumerate(cols):
            if cc == c or abs(cc - c) == r - i: return False
        return True
    def bt(cols):
        if len(cols) == n:
            sol.append(cols[:]); return
        for c in range(n):
            if seguro(cols, c):
                cols.append(c); bt(cols); cols.pop()
    bt([])
    return sol
print(len(n_reinas(4)), len(n_reinas(6)), n_reinas(4)[0])`,
String.raw`print([1, 2, 3][5])`,
String.raw`print("a" + 1)`,
String.raw`x = undefined_name + 1`,
String.raw`def f(x):
    return x.valor
f(None)`,
String.raw`def f(a, b): return a
f(1)`,
String.raw`d = {}
print(d["x"])`,
String.raw`print(int("abc"))`,
String.raw`print(1 / 0)`,
String.raw`class N:
    def __init__(self): self.v = 1
n = N()
print(n.izquierdo)`,
String.raw`def f(n): return f(n - 1)
f(5)`,
String.raw`print(5 // 0)`,
String.raw`l = [1, 2]
l.pop(5)`,
String.raw`print(len(5))`,
String.raw`for x in 5: pass`,
String.raw`print(None < 3)`,
String.raw`a, b = [1, 2, 3]`,
String.raw`nums = [1, 2, 3]
total = 0
for n in nums:
    total += n
print(total / len(nums), total // len(nums), total % 4, max(nums) - min(nums))
import math
print(math.sqrt(16), math.floor(2.7), math.ceil(2.1), math.log2(8), math.pi > 3, math.gcd(12, 18), math.factorial(5), math.inf > 10**9)`,
String.raw`x = 10
def f():
    return x + 1
print(f())
def g():
    y = 1
    def h():
        return y + 1
    return h()
print(g())
print(type(1) == int, type("a").__name__, type([]) == list, isinstance(True, int), isinstance(1.5, (int, float)), isinstance("a", int))`,
String.raw`class Pila:
    def __init__(self):
        self.items = []
    def push(self, x): self.items.append(x)
    def pop(self): return self.items.pop()
    def vacia(self): return len(self.items) == 0
    def __len__(self): return len(self.items)
p = Pila()
p.push(1); p.push(2)
print(len(p), p.pop(), p.vacia(), p.pop(), p.vacia(), bool(p))
class Cont:
    total = 0
    def __init__(self): Cont.total += 1
Cont(); Cont()
print(Cont.total)`,
String.raw`def bfs(raiz):
    from collections import deque
    cola = deque([raiz]); out = []
    while cola:
        n = cola.popleft()
        out.append(n[0])
        for h in n[1]:
            cola.append(h)
    return out
arbol = ('A', [('B', [('D', []), ('E', [])]), ('C', [('F', [])])])
print(bfs(arbol))`,
String.raw`def altura(n):
    if n is None: return -1
    return 1 + max(altura(n[1]), altura(n[2]))
def hojas(n):
    if n is None: return 0
    if n[1] is None and n[2] is None: return 1
    return hojas(n[1]) + hojas(n[2])
def tam(n): return 0 if n is None else 1 + tam(n[1]) + tam(n[2])
t = (1, (2, (4, None, None), (5, None, None)), (3, None, None))
print(altura(t), hojas(t), tam(t), altura(None))`
];
